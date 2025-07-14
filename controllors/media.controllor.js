var express = require('express');
var ApiError = require('../utils/ApiError');
var ApiResponse = require('../utils/ApiResponse');
var asyncHandler = require('../utils/asyncHandler');
var removeContentTypeFromUrl = require("../utils/urlGenerator.js");
const { v4: uuidv4 } = require('uuid');
var AWS = require('aws-sdk');

AWS.config.update({
    accessKeyId : "AKIAVVTU3VFINIXILKMC",
    secretAccessKey : "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",
    region : "ap-southeast-1"
});
var s3 = new AWS.S3();

var generateSignedUrl = asyncHandler(async(req , res) => {
    var fileName = `${uuidv4()}.png`;

    try{
        var params = {
            Bucket : "serverless-media-processing-upload",
            Key : `uploads/${fileName}`,
            ContentType : "image/png"
        }


        var url = await s3.getSignedUrlPromise("putObject" , params);
        var correctedUrl = removeContentTypeFromUrl(url);

        return ApiResponse.success(res , "signed url generated" , {
            "signed url" : url,
            "filename" : fileName,
        })
    }
    catch(error){
        return ApiResponse.error(res , error.statusCode || 400 , error.message , error);
    }
})

module.exports = generateSignedUrl;