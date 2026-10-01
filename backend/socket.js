const { Server } = require('socket.io');
const Message = require('./models/Message');

function initSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: '*', // Adjust to your frontend URL in production
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    // Each user joins a private room named by their user ID
    socket.on('join', (userId) => {
      socket.join(userId);
    });

    // Handle sending a message
    socket.on('sendMessage', async ({ senderId, recipientId, content }) => {
      try {
        // 1. Save to MongoDB
        const newMessage = await Message.create({ senderId, recipientId, content });

        // 2. Emit to recipient's room
        io.to(recipientId).emit('receiveMessage', newMessage);

        // 3. Confirm back to sender
        socket.emit('messageSent', newMessage);
      } catch (err) {
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    socket.on('disconnect', () => {
      // Clean disconnect
    });
  });

  return io;
}

module.exports = initSocket;