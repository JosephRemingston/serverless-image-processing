const express = require('express');
const { v4: uuidv4 } = require('uuid');
const AWS = require('aws-sdk');
var dotenv = require("dotenv");
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const getSecrets = require('../utils/aws-secrets');

dotenv.config();

const secrets = getSecrets();
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESSKEY,
  secretAccessKey: process.env.AWS_SECRETACCESSKEY,
  region: 'ap-southeast-1',
});

const s3 = new AWS.S3();

function sanitizeEmail(email) {
  return email.replace(/[@.]/g, '_');
}

const generateSignedUrl = asyncHandler(async (req, res) => {
  if (!req.user || !req.user.username) {
    throw new ApiError(401, 'User not authenticated');
  }

  const emailSafe = sanitizeEmail(req.user.username);
  const uniqueId = uuidv4();
  const fileName = `${emailSafe}_${uniqueId}.png`;

  try {
    const params = {
      Bucket: 'serverless-media-processing-upload',
      Key: `uploads/${fileName}`,
      ContentType: "image/png",
      Expires: 300,
    };

    const signedUrl = await s3.getSignedUrlPromise('putObject', params);

    return ApiResponse.success(res, 'Signed URL generated', {
      signedUrl,
      fileName,
      uploadKey: params.Key,
    });
  } catch (error) {
    console.error('Error generating signed URL:', error);
    return ApiResponse.error(res, error.statusCode || 400, error.message, error);
  }
});

module.exports = { generateSignedUrl };