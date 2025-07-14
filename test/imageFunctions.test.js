const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const AWS = require('aws-sdk');
require('dotenv').config();

// Set up Rekognition
const rekognition = new AWS.Rekognition({ region: process.env.AWS_REGION || 'ap-southeast-1' });

async function testProcessImage(imagePath) {
    try {
        const imageBuffer = fs.readFileSync(path.resolve(imagePath));
        console.log(imageBuffer);
        const processedImage = await sharp(imageBuffer)
            .resize({ width: 1024 })
            .jpeg({ quality: 10 })
            .toBuffer();
        fs.writeFileSync('output_processed.jpg', processedImage);
        console.log('Image processed and saved as output_processed.jpg');
    } catch (err) {
        console.error('Error processing image:', err);
    }
}

async function testAiRecognition(imagePath) {
    try {
        const imageBuffer = fs.readFileSync(path.resolve(imagePath));
        console.log(imageBuffer);
        const result = await rekognition
            .detectLabels({
                Image: { Bytes: imageBuffer },
                MaxLabels: 10,
                MinConfidence: 70,
            })
            .promise();
        console.log(result);
        console.log('AI Recognition Labels:', result.Labels);
    } catch (err) {
        console.error('Error detecting labels:', err);
    }
}

// Example usage:
// testProcessImage('./path/to/your/image.jpg');
// testAiRecognition('./path/to/your/image.jpg');
testAiRecognition("../sample.png")
module.exports = { testProcessImage, testAiRecognition }; 