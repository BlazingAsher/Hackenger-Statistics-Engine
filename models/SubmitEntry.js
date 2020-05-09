const mongoose = require('mongoose');

let schema = new mongoose.Schema({
    timestamp : {
        type: Number,
        required: true
    },
    namespace: {
        type: String,
        required: true
    },
    question: {
        type: String,
        required: true
    },
    submission: {
        type: String,
        required: true
    }

});

module.exports = mongoose.model('SubmitEntry', schema);