const express = require('express');
const { getProcessedImageData, createProcessedImage } = require('../controllors/processedImage.controllor.js');
const { verifyJWT } = require('../middleware/auth.middleware.js');

const router = express.Router();

router.get('/get-processed-image', getProcessedImageData);
router.post('/create-processed-image', createProcessedImage);

module.exports = router;
