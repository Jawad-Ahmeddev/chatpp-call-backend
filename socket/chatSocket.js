const Message = require('../models/message');
const User = require('../models/User');
const  Chat = require('../models/chat');
const { sendNotification } = require('../controllers/chatController');
let userTokens = {};  // {userId: socketId} // Store tokens by user ID

let token1 = '';
let username= '';

module.exports = function (io) {
   

    io.on('connection', (socket) => {
      console.log('User connected:', socket.id);
  
      socket.on('registerToken', (tokenData) => {
        const { userId, token } = tokenData;
        userTokens[userId] = token;  // Store the token by userId
        console.log(`Token registered for user ${userId}: ${token}`);
    });

    socket.on('register', (userId) => {
      userTokens[userId] = socket.id;
      console.log(`User connected: ${userId} with socket ID: ${socket.id}`);
   });

   socket.on('signal', (data) => {
    const { signal, toUserId } = data;
    const toSocketId = userTokens[toUserId];
    if (toSocketId) {
      io.to(toSocketId).emit('signal', { signal, fromUserId: socket.id });
      console.log(`Signal sent from ${socket.id} to ${toUserId}`);
    } else {
      console.log(`User ${toUserId} is not connected`);
    }
  });
  
    
      // Join the room using roomId
      socket.on('joinChat', (chatId, userId) => {
        socket.join(chatId);
        console.log(`User ${userId} joined chat: ${chatId} with socket ID: ${socket.id}`);
      
        // Notify other users in the chat about the new user
        io.to(chatId).emit('userJoined', { userId: userId, socketId: socket.id });
      });
      
  
      // Handle new message
      socket.on('message', async (messageData) => {
        const { chatId, message, sender } = messageData;
        try {
          const fullSender = await User.findById(sender._id).select('username profilePicture');
          const newMessage = new Message({
            chat: chatId,
            message,
            sender: fullSender._id,
          });
          await newMessage.save();
      
          let chat = await Chat.findById(chatId);
          if (chat) {
            chat.lastMessage = newMessage._id;

            // Save the updated chat
            await chat.save();
          }

         
  
          console.log('Updated chat with lastMessage:', chat);
  
          const fullMessageData = {
            chatId,
            message,
            sender: {
              _id: fullSender._id,
              username: fullSender.username,
              profilePicture: fullSender.profilePicture,
            },
            createdAt: newMessage.createdAt,
          };
          io.to(chatId).emit('message', fullMessageData);

          username = fullMessageData.sender.username;
          // Emit the message to the chat room
          console.log('Message broadcasted to chat room:', chatId);
              console.log('Emitting new message to chat room:', chatId, fullMessageData);
              
              const recipient = chat.participants.find(participant => participant._id.toString() !== sender._id.toString());

              // Check if the recipient has a registered token
              const recipientToken = userTokens[recipient._id.toString()];

              if (recipientToken) {
                  // Send notification to the recipient
                  sendNotification(recipientToken, message, fullSender.username);
              } else {
                  console.log('Recipient not online or token not registered.');
              }        }
               catch (error) {
          console.error('Error emitting message:', error);
        }
      });

      
      
  
      socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
        for (let userId in userTokens) {
          if (userTokens[userId] === socket.id) {
             delete userTokens[userId];
             console.log(`User ${userId} disconnected`);
             break;
          }
       }
        
      });
    });
  };