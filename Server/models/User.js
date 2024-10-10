// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true, // Ensure usernames are unique
    },
    location: {
        lat: {
            type: Number,
            required: true,
        },
        lon: {
            type: Number,
            required: true,
        },
    },
});

const User = mongoose.model('User', userSchema);
module.exports = User;
