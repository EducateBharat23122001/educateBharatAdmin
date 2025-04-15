import AWS from 'aws-sdk';



const handleS3Upload = (file) => {
    AWS.config.update({
        accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
        region: process.env.REACT_APP_AWS_REGION
    });


    if (file) {
        const s3 = new AWS.S3();
        const params = {
            Bucket: process.env.REACT_APP_AWS_BUCKET_NAME,
            Key: file.name,
            Body: file,
            ACL: 'public-read' // Set the appropriate ACL for your use case
        };

        s3.upload(params, (err, data) => {
            if (err) {
                console.error('Error uploading file:', err);
                return err;
            } else {
                console.log('File uploaded successfully:', data.Location);
                // Perform any additional actions after successful upload

                return data.Location;
            }
        });
    }
};

export default handleS3Upload;