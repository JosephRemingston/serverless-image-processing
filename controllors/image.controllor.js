const sharp = require('sharp');
const AWS = require('aws-sdk');
var dotenv = require("dotenv");
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const getSecrets = require("../utils/aws-secrets");


dotenv.config();

const rekognition = new AWS.Rekognition({ 
    region: process.env.AWS_REGION,
    credentials:{
        accessKeyId: process.env.AWS_ACCESSKEY,
        secretAccessKey: process.env.AWS_SECRETACCESSKEY
    } 
});
const s3 = new AWS.S3();

// POST /process-image
const processImage = asyncHandler(async (req, res) => {
    let imageBuffer;

    if (req.file) {
        imageBuffer = req.file.buffer;
    } else if (req.body.filename) {
        const s3Object = await s3.getObject({
            Bucket: 'serverless-media-processing-upload',
            Key: req.body.filename
        }).promise();
        imageBuffer = s3Object.Body;
    } else {
        return ApiResponse.error(res, 400, "No image provided", {});
    }

    const processedImage = await sharp(imageBuffer)
        .resize({ width: 1024 })
        .jpeg({ quality: 80 })
        .toBuffer();

    const base64Image = processedImage.toString('base64');

    return ApiResponse.success(res, "Image successfully processed", {
        "statusCode": 200,
        "processedImageBase64": base64Image
    });
});

// POST /ai-recognition
const aiRecognition = asyncHandler(async (req, res) => {
    let imageBuffer;

    if (req.file) {
        imageBuffer = req.file.buffer;
    } else if (req.body.filename) {
        const s3Object = await s3.getObject({
            Bucket: 'serverless-media-processing-upload',
            Key: req.body.filename
        }).promise();
        imageBuffer = s3Object.Body;
    } else {
        return ApiResponse.error(res, 400, "No image provided", {});
    }

    const result = await rekognition.detectLabels({
        Image: { Bytes: imageBuffer },
        MaxLabels: 10,
        MinConfidence: 70,
    }).promise();

    ApiResponse.success(res, "AI recognition successful", {
        "statusCode": 200,
        "labels": result.Labels
    });
});

module.exports = {
    processImage,
    aiRecognition,
};