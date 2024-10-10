const User = require('../models/User');

const registerUser = async (req, res) => {
    const { username, latitude, longitude } = req.body;

    try {
        const newUser = new User({ username, latitude, longitude });
        await newUser.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(400).json({ error: 'Error registering user' });
    }
};

module.exports = {
    registerUser,
};
