MinIO Image Storage with Express.js
Project Demo <!-- Add a demo GIF if available -->

A simple web application that demonstrates how to upload, store, and display images using MinIO object storage with an Express.js backend and vanilla HTML/CSS frontend.

Features
Upload images via web interface

Store images in MinIO object storage

Display all uploaded images

Dockerized setup for easy deployment

Simple, clean UI

Prerequisites
Docker installed

Node.js (v14 or higher)

npm or yarn

Setup Instructions
1. Start MinIO Container
Run the following command to start a MinIO instance:

bash
docker run -d \
  -p 9000:9000 \
  -p 9001:9001 \
  --name minio \
  -v minio_data:/data \
  -e "MINIO_ROOT_USER=minioadmin" \
  -e "MINIO_ROOT_PASSWORD=minioadmin" \
  quay.io/minio/minio server /data --console-address ":9001"
2. Configure Backend
Navigate to the backend directory:

bash
cd backend
Install dependencies:

bash
npm install
Create a .env file with the following content:

MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET_NAME=images
Start the server:

bash
npm start
3. Configure Frontend
Open frontend/js/app.js and verify the API endpoint:

javascript
const API_BASE_URL = 'http://localhost:3000'; // Change if your backend runs on different port
Open index.html in your browser.

Usage
Access the web interface at http://localhost (or wherever you host the frontend)

Click "Choose File" to select an image

Click "Upload" to send it to your MinIO storage

View all uploaded images displayed below the upload form

Project Structure
.
├── backend/               # Express.js server
│   ├── routes/           # API routes
│   ├── services/         # MinIO service
│   ├── app.js            # Main server file
│   └── package.json
├── frontend/             # HTML/CSS/JS frontend
│   ├── css/
│   ├── js/
│   └── index.html
├── docker-compose.yml    # Docker configuration
└── README.md
API Endpoints
POST /api/upload - Upload an image

GET /api/images - Get list of all images

GET /api/image/:name - Get a specific image

Troubleshooting
MinIO connection issues: Verify the MinIO container is running and credentials match

CORS errors: Ensure your frontend and backend origins are properly configured

Bucket not found: The backend should create the bucket automatically on first run

License
MIT License - see LICENSE file for details

Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

