const express = require('express');
const multer = require('multer');
const { processImage, aiRecognition } = require('../controllors/image.controllor');

const router = express.Router();
const upload = multer();

router.post('/process-image', upload.single('image'), processImage);
router.post('/ai-recognition', upload.single('image'), aiRecognition);

module.exports = router; 