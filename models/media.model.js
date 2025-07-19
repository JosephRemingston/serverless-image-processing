var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var mediaSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    fileName: {
        type: String,
        required: true,
        trim: true
    },
    fileUrl : {
        type: String,
        required: true,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

var media = mongoose.model("media", mediaSchema);
module.exports = media;