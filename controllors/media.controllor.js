var express = require('express');
var ApiError = require('../utils/ApiError');
var ApiResponse = require('../utils/ApiResponse');
var asyncHandler = require('../utils/asyncHandler');
var removeContentTypeFromUrl = require("../utils/urlGenerator.js");
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


const generateSignedUrl = asyncHandler(async(req, res) => {
    if (!req.user || !req.user.username) {
        throw new ApiError(401, "User not authenticated");
    }
    
    const userId = req.user.username;
    const fileName = `${userId}.png`;

    try{
        var params = {
            Bucket : "serverless-media-processing-upload",
            Key : `uploads/${fileName}`,
            ContentType : "image/png"
        }


        var url = await s3.getSignedUrlPromise("putObject" , params);

        return ApiResponse.success(res , "signed url generated" , {
            "signed url" : url,
            "filename" : fileName,
        })
    }
    catch(error){
        return ApiResponse.error(res , error.statusCode || 400 , error.message , error);
    }
})

module.exports = { generateSignedUrl };