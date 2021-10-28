require('dotenv').config()

const S3 = require('aws-sdk/clients/s3');
var fs = require('fs');
const {Duplex} = require('stream');
const bucket_name=process.env.AWS_BUCKET_NAME
const region=process.env.AWS_BUCKET_REGION
const accessKeyId=process.env.AWS_ACCESS_KEY
const secretAccessKey=process.env.AWS_SECRET_KEY


var img_path = '/image1';
var filename = 'profile_pic';

const s3 = new S3({
    region,
    accessKeyId,
    secretAccessKey
});

// uploads a file to s3
function uploadFile(user,file,imageType) {
  
    //const fileStream = fs.createReadStream(file)
    function bufferToStream(myBuuffer) {
        let tmp = new Duplex();
        tmp.push(myBuuffer);
        tmp.push(null);
        return tmp;
    }
    
    const fileStream = bufferToStream(file);
    
    const uploadParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Body: file,
      Key: `${user.id}/${filename}.${imageType}`
    }
    console.log(uploadParams);
    return s3.upload(uploadParams).promise();
    // s3.upload(uploadParams, function (err, data) { 
    //     if(err){
    //         console.log(err)
    //         return "error while uploading to s3"
    //     }
    //     return "uploaded to s3";
    //  });
  }
async function deleteFile(imagePath){
    const params = {
        Bucket: bucket_name,
        Key: imagePath
    };
    const result = await s3.deleteObject(params).promise();
    return result.DeleteMarker;
}
module.exports ={
    uploadFile : uploadFile,
    deleteFile : deleteFile
}
