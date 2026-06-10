const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const questionSchema = new Schema({
    text: {
        type: String,
        required: true
    },

    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' 
    },
    options: [String],
    keywords: [String],
    correctAnswerIndex: Number
}, {
    timestamps: true
});

module.exports = mongoose.model('Question', questionSchema);