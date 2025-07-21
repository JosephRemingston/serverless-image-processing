const mongoose = require('mongoose');
const { Schema } = mongoose;

const ProcessedImageSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    fileName : {
        type : String, 
        required : true
    },
    processedFile: {
        type: String, 
        required: false 
    },
    rawAiResponse: {
        type: Schema.Types.Mixed, 
        required: true 
    },
    createdAt: {
        type: Date, 
        default: Date.now 
    }
});

module.exports = mongoose.model('processedImage', ProcessedImageSchema);