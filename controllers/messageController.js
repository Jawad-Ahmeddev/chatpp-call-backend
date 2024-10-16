// controllers/messageController.js
const Message = require('../models/message');
const Chat = require('../models/chat');

exports.getMessages = async (req, res) => {
  const {chatId} = req.params;
  try {
    const messages = await Message.find({ chat: chatId }).populate('sender', 'username profilePicture');
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching messages.' });
  }
};

exports.sendMessage = async (req, res) => {
  console.log("Hi i am from the backend")
  try {
    const { chatId, sender, message } = req.body;
    const newMessage = new Message({ chat: chatId, sender, message });
    await newMessage.save();

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }
    console.log('New message saved:', newMessage);

    chat.lastMessage = newMessage._id;  // Update lastMessage with the new message
    await chat.save();

    console.log("This is the lastmessage from the backend: ", chat.lastMessage)

    // Emit the new message to clients in the chat room
    req.app.get('io').to(chatId).emit('message', newMessage);
    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ error: 'Error sending message.' });
  }
};
