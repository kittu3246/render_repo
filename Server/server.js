// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIO = require('socket.io');
const userRoutes = require('./routes/userRoutes'); // Import user routes
const User = require('./models/User'); // Ensure this points to your User model
require('dotenv').config(); // Only if you still want to use .env for other variables

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
});

app.use(cors());
app.use(express.json());
app.use('/api/users', userRoutes); // Use user routes

// MongoDB connection string
const MONGODB_URI = "mongodb://localhost:27017/nearest-user-db";

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('MongoDB connected');
}).catch(err => {
    console.error('MongoDB connection error:', err);
});

// Function to calculate distance between two points (Haversine formula)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
};

// Socket connection
io.on('connection', (socket) => {
    console.log('New client connected');

    // Event listener for user registration
    socket.on('register_user', async (data) => {
        const { username, location } = data;
        const user = new User({ username, location });
        await user.save();
        console.log(`User registered: ${username}`);

        // Store socket ID in user document for message sending
        user.socketId = socket.id;
        await user.save();
    });

    // Event listener for sending messages
    socket.on('send_message', async (data) => {
        const { username, message } = data;

        // Find the sender
        const sender = await User.findOne({ username });
        const users = await User.find({ username: { $ne: username } }); // Exclude the sender

        let nearestUser = null;
        let nearestDistance = Infinity;

        // Calculate the nearest user based on distance
        users.forEach(user => {
            const distance = calculateDistance(sender.location.lat, sender.location.lon, user.location.lat, user.location.lon);
            if (distance < nearestDistance) {
                nearestDistance = distance;
                nearestUser = user;
            }
        });

        if (nearestUser) {
            // Emit the message to the nearest user
            io.to(nearestUser.socketId).emit('receive_message', {
                from: username,
                message: message
            });
            console.log(`Message from ${username} sent to nearest user: ${nearestUser.username}`);
        } else {
            console.log('No users available to send the message');
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

// Server setup
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
