const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    customer_name: {
        type: String,
        required: true
    },
    phone_number: {
        type: String,
        required: true
    },
    phone_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Phone'
    },
    phone_name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Order', orderSchema);
