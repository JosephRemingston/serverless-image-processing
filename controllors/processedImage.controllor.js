const express = require("express");
const ApiResponse = require("../utils/ApiResponse.js");
const ApiError = require("../utils/ApiError.js");
const asyncHandler = require("../utils/asyncHandler.js");
const ProcessedImage = require("../models/processedImage.model.js");




const getProcessedImageData = asyncHandler(async (req, res) => {
    try {
        const { userId, fileName } = req.body;
        const query = {};
        
        if (userId) {
            query.userId = userId;
        }
        
        if (fileName) {
            query.fileUrl = { $regex: fileName, $options: 'i' }; // Case-insensitive search
        }

        if (!userId && !fileName) {
            return ApiResponse.error(res, 400, "At least one search parameter (userId or fileName) is required");
        }

        const processedImages = await ProcessedImage.find(query)
            .sort({ createdAt: -1 }) // Sort by newest first

        if (!processedImages || processedImages.length === 0) {
            return ApiResponse.error(res, 404, "No processed images found matching the criteria");
        }

        return ApiResponse.success(res, "Processed images retrieved successfully", {
            count: processedImages.length,
            images: processedImages
        });
    } catch (error) {
        console.error('Error in getProcessedImageData:', error);
        return ApiResponse.error(
            res, 
            error.statusCode || 500,
            error.message || 'Internal server error while retrieving processed images',
            { requestId: error.requestId }
        );
    }
});


const createProcessedImage = asyncHandler(async (req, res) => {
    try {
        const { userId, fileId, fileUrl, processedJson } = req.body;

        if (!userId || !fileId || !fileUrl || !processedJson) {
            return ApiResponse.error(res, 400, "Missing required fields");
        }

        const newProcessedImage = await ProcessedImage.create({
            userId,
            fileId,
            fileUrl,
            processedJson
        });

        return ApiResponse.success(res, "Processed image record created successfully", newProcessedImage);
    } catch (error) {
        console.error('Error in createProcessedImage:', error);
        return ApiResponse.error(
            res,
            error.statusCode || 500,
            error.message || 'Failed to create processed image record',
            { requestId: error.requestId }
        );
    }
});

module.exports = {
    getProcessedImageData,
    createProcessedImage
};