module.exports = {
    listBuckets: function(minioClient) {
        minioClient.listBuckets(function(err, buckets) {
            if (err) return console.log(err);
            console.log('Buckets:', buckets);
        });
    }
};
