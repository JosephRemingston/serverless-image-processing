const mongoose = require('mongoose');
const { Schema } = mongoose;

const ProcessedImageSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    fileName : {type : String , required : true},
    originalFile: { type: String, required: true },   // S3 path to uploaded image
    processedFile: { type: String, required: true },   // S3 path to processed image

    rawAiResponse: { type: Schema.Types.Mixed, required: true },   // Entire AI Rekognition output (raw JSON)
    rawProcessingResponse: { type: Schema.Types.Mixed, required: true }, // Entire image processing response (raw JSON)

    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('processedImage', ProcessedImageSchema);