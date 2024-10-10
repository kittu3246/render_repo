// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Ensure this points to your User model

// Register User Route
router.post('/register', async (req, res) => {
    const { username, latitude, longitude } = req.body;

    try {
        // Check if the user already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        // Create a new user
        const user = new User({
            username,
            location: {
                lat: latitude,
                lon: longitude,
            },
        });

        await user.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Error registering user:', error);
        if (error.code === 11000) { // Duplicate key error
            return res.status(400).json({ message: 'Username already exists' });
        }
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
