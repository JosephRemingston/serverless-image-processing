const express = require('express');
const { getProcessedImageData, createProcessedImage } = require('../controllors/processedImage.controllor.js');
const { verifyJWT } = require('../middleware/auth.middleware.js');

const router = express.Router();

// Protected routes - require authentication
router.use(verifyJWT);

// GET /api/processed-images?userId=123&fileName=example.jpg
router.get('/get-processed-image', getProcessedImageData);

// POST /api/processed-images
router.post('/create-processed-image', createProcessedImage);

module.exports = router;
