const mongoose = require('mongoose');

const phoneSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    brand: {
        type: String,
        default: null
    },
    price: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        default: null
    },
    image: {
        type: String,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Phone', phoneSchema);
