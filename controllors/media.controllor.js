var express = require('express');
var ApiError = require('../utils/ApiError');
var ApiResponse = require('../utils/ApiResponse');
var asyncHandler = require('../utils/asyncHandler');
var getSecrets = require("../utils/aws-secrets");
const { v4: uuidv4 } = require('uuid');
var AWS = require('aws-sdk');

var secrets = getSecrets();
AWS.config.update({
    accessKeyId : secrets.AWS_ACCESSKEY,
    secretAccessKey : secrets.AWS_SECRETACCESSKEY,
    region : "ap-southeast-1"
});

var s3 = new AWS.S3();

function sanitizeEmail(email) {
    return email.replace(/[@.]/g, "_");
}

const generateSignedUrl = asyncHandler(async(req, res) => {
    if (!req.user || !req.user.username) {
        throw new ApiError(401, "User not authenticated");
    }

    const emailSafe = sanitizeEmail(req.user.username);
    const uniqueId = uuidv4();

    const fileName = `${emailSafe}_${uniqueId}.png`;

    try {
        const params = {
            Bucket: "serverless-media-processing-upload",
            Key: `uploads/${fileName}`,
            ContentType: "image/png",
            Expires: 300 // URL valid for 5 mins
        };

        const url = await s3.getSignedUrlPromise("putObject", params);

        return ApiResponse.success(res, "Signed URL generated", {
            signedUrl: url,
            fileName: fileName,
            uploadKey: params.Key // Useful if you need to reference it later
        });
    } catch (error) {
        console.error("Error generating signed URL:", error);
        return ApiResponse.error(res, error.statusCode || 400, error.message, error);
    }
});

module.exports = { generateSignedUrl };