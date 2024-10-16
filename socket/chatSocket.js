const Message = require('../models/message');
const User = require('../models/User');
const  Chat = require('../models/chat');
const { sendNotification } = require('../controllers/chatController');

let token1 = '';
let username= '';

module.exports = function (io) {
  let userTokens = {};  // Store tokens by user ID

    io.on('connection', (socket) => {
      console.log('User connected:', socket.id);
  
      socket.on('registerToken', (tokenData) => {
        const { userId, token } = tokenData;
        userTokens[userId] = token;  // Store the token by userId
        console.log(`Token registered for user ${userId}: ${token}`);
    });
      // Join the room using roomId
      socket.on('joinChat', (chatId) => {
        socket.join(chatId);
        console.log(`User joined chat: ${chatId}`);
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
      });
    });
  };