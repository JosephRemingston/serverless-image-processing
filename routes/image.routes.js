const express = require('express');
const multer = require('multer');
const { processImage, aiRecognition } = require('../controllors/image.controllor');

const router = express.Router();
const upload = multer();

router.post("/process-image/upload", upload.single("image"), processImage);
router.post("/ai-recognition/upload", upload.single("image"), aiRecognition);

// For Lambda or JSON clients:
router.post("/process-image", processImage);
router.post("/ai-recognition", aiRecognition);

module.exports = router;
