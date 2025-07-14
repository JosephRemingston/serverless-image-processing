const sharp = require('sharp');
const AWS = require('aws-sdk');
const axios = require('axios');
const asyncHandler = require('../utils/asyncHandler');
var ApiError = require("../utils/ApiError");
var ApiResponse = require("../utils/ApiResponse");

// Set up Rekognition
const rekognition = new AWS.Rekognition({ region: process.env.AWS_REGION || 'ap-southeast-1' });

// POST /process-image
const processImage = asyncHandler(async (req, res) => {
    var imageBuffer;

    // Case 1: User uploads file using form-data
    if (req.file) {
        imageBuffer = req.file.buffer;
    } 
    // Case 2: Lambda sends image URL
    else if (req.body.imageUrl) {
        const response = await axios.get(req.body.imageUrl, { responseType: 'arraybuffer' });
        imageBuffer = Buffer.from(response.data, 'binary');
    } 
    // No image found
    else {
        return ApiResponse.error(res, 400, "No image provided", {});
    }

    // Compress the image
    try {
        const processedImage = await sharp(imageBuffer)
            .resize({ width: 1024 })
            .jpeg({ quality: 80 })
            .toBuffer();

        const base64Image = processedImage.toString('base64');

        return ApiResponse.success(res, "Image successfully processed", {
            "statusCode": 200,
            "processedImageBase64": base64Image
        });

    } catch (err) {
        console.error('Error processing image:', err);
        return ApiResponse.error(res, err.statusCode || 400, err.message, err);
    }
});


// POST /ai-recognition
const aiRecognition = asyncHandler(async (req, res) => {
    let imageBuffer;

    if (req.file) {
        imageBuffer = req.file.buffer;
    } else if (req.body.imageUrl) {
        const response = await axios.get(req.body.imageUrl, { responseType: 'arraybuffer' });
        imageBuffer = Buffer.from(response.data, 'binary');
    } else {
        return ApiResponse.error(res, 400, "No image provided", {});
    }

    try {
        const result = await rekognition.detectLabels({
            Image: { Bytes: imageBuffer },
            MaxLabels: 10,
            MinConfidence: 70,
        }).promise();

        ApiResponse.success(res, "Image processed successfully", {
            "statusCode": 200,
            "labels": result
        });

    } catch (err) {
        console.error('Error detecting labels:', err);
        return ApiResponse.error(res, err.statusCode || 400, err.message, err);
    }
});


module.exports = {
    processImage,
    aiRecognition,
}; 