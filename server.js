const express = require('express');
const multer = require('multer');
const path = require('path');
const Minio = require('minio');
const fs = require('fs');
const app = express();
const port = 3000;

// Configure MinIO client
const minioClient = new Minio.Client({
    endPoint: 'localhost',
    port: 9000,
    useSSL: false,
    accessKey: 'admin',
    secretKey: 'admin321'
});

// Set up multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Serve static files
app.use(express.static(__dirname));

// Add this route handler for the root path
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'upload.html'));
});

// Handle file upload
app.post('/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    const bucketName = 'smh';
    const objectName = Date.now() + '-' + req.file.originalname;
    const filePath = req.file.path;
    const metaData = {
        'Content-Type': req.file.mimetype,
    };

    // Upload file to MinIO
    minioClient.fPutObject(bucketName, objectName, filePath, metaData, (err, etag) => {
        // Delete the temporary file
        fs.unlinkSync(filePath);
        
        if (err) {
            console.log(err);
            return res.status(500).json({ error: 'Error uploading to MinIO' });
        }
        
        // Get a presigned URL for the uploaded object
        minioClient.presignedGetObject(bucketName, objectName, 24*60*60, (err, presignedUrl) => {
            if (err) {
                return res.status(500).json({ error: 'Error generating URL' });
            }
            
            res.json({ 
                success: true, 
                message: 'File uploaded successfully!',
                objectName: objectName,
                url: presignedUrl
            });
        });
    });
});

// Add a route to get all images from the MinIO bucket
app.get('/images', (req, res) => {
    const bucketName = 'smh';
    const imageList = [];
    
    // List all objects in the bucket
    const stream = minioClient.listObjects(bucketName, '', true);
    
    stream.on('data', (obj) => {
        // For each object found, add it to our list
        imageList.push({
            name: obj.name,
            size: obj.size,
            lastModified: obj.lastModified
        });
    });
    
    stream.on('error', (err) => {
        console.error('Error listing objects:', err);
        return res.status(500).json({ error: 'Error listing objects: ' + err.message });
    });
    
    stream.on('end', () => {
        // Once we have all objects, generate presigned URLs for each
        const promises = imageList.map(image => {
            return new Promise((resolve, reject) => {
                minioClient.presignedGetObject(bucketName, image.name, 24*60*60, (err, url) => {
                    if (err) {
                        console.error('Error generating URL for', image.name, err);
                        reject(err);
                    } else {
                        image.url = url;
                        resolve(image);
                    }
                });
            });
        });
        
        // Wait for all presigned URLs to be generated
        Promise.all(promises)
            .then(() => {
                // Sort images by last modified date (newest first)
                imageList.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));
                res.json({ images: imageList });
            })
            .catch(err => {
                console.error('Error generating presigned URLs:', err);
                res.status(500).json({ error: 'Error generating presigned URLs' });
            });
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});