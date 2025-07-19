const mongoose = require('mongoose');
const { Schema } = mongoose;

const processedImageSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    fileId: {
        type: Schema.Types.ObjectId,
        ref: 'media',   // Corrected from 'Mmdia'
        required: true
    },
    fileUrl: {
        type: String,
        required: true,
        trim: true
    },
    processedJson: {   // Fixed name typo (proceeedJson)
        type: Schema.Types.Mixed,  // Accepts any valid JSON object
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('processedImage', processedImageSchema);