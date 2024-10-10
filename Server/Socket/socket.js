const socketSetup = (io) => {
    io.on('connection', (socket) => {
        console.log('New client connected');

        socket.on('disconnect', () => {
            console.log('Client disconnected');
        });

        // Add more events as needed
    });
};

module.exports = socketSetup;
