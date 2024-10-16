const Message = require('../models/message');
const Chat = require('../models/chat');
const User = require('../models/User');
const admin = require('firebase-admin');
const serviceAccount = require('../chat-notification-c4f7e-firebase-adminsdk-whx1a-9f97cb6298.json');

// Sending a message

// chatController.js
// chatController.js
exports.sendMessage = async (req, res) => {
  const { chatId, message, sender } = req.body;

  try {
    // Find the chat by chatId
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }
    // Create a new message associated with the roomId
    const newMessage = new Message({ chat: chatId, message, sender });
    await newMessage.save();
    chat.lastMessage = newMessage._id;
    await chat.save();
    req.app.get('io').to(chatId).emit('message', newMessage);
    console.log("This is the lastmessage from the backend: ", chat.lastMessage)

    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ error: 'Error sending message.' });
  }
};

  
exports.createOrJoinPersonalChat = async (req, res) => {
  const { currentUserEmail, userEmail } = req.body;

  try {
    // Fetch the current user and the target user from the database
    const currentUser = await User.findOne({ email: currentUserEmail });
    const targetUser = await User.findOne({ email: userEmail });

    // Check if both users exist in the database
    if (!currentUser || !targetUser) {
      return res.status(404).json({ message: 'One or both users not found.' });
    }

    // Check if a personal chat between these users already exists
    let chat = await Chat.findOne({
      type: 'personal',
      participants: { $all: [currentUser._id, targetUser._id] }
    });

    // If chat exists, return the existing chat
    if (chat) {
      return res.status(200).json(chat);
    }

    // If no chat exists, create a new one
    chat = new Chat({
      type: 'personal',
      participants: [currentUser._id, targetUser._id]
    });

    // Save the new chat and return the result
    await chat.save();
    res.status(201).json(chat);
  } catch (error) {
    res.status(500).json({ message: 'Error creating or joining chat.', error });
  }
};
// Fetching messages for a room
exports.getChatById = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId).populate('participants');
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found.' });
    }
    res.json(chat);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching chat.' });
  }
};

exports.getMessagesByChatId = async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId }).populate('sender');
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching messages.' });
  }
};
exports.getChatById = async (req, res) => {
  const { chatId } = req.params;

  try {
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }
    return res.status(200).json(chat);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching chat', error });
  }
};


// Fetch recent chats for a user
exports.getRecentChats = async (req, res) => {
  try {
      const userId = req.body.userId;
      
      const recentChats = await Chat.find({
          participants: userId
      }).sort({ updatedAt : -1 })  // Sort by updatedAt to get the latest chats
      .populate('participants', 'username email profilePicture')
      .populate('lastMessage', 'message sender createdAt');  // Populate the lastMessage field

      res.status(200).json(recentChats);
  } catch (err) {
      res.status(500).json({ message: 'Failed to fetch recent chats', error: err });
  }
};


// Fetch all personal chats for a user
exports.getAllPersonalChats = async (req, res) => {
  try {
      const userId = req.body.userId;

      const personalChats = await Chat.find({
          type: 'personal',
          participants: userId
      }).populate('participants', 'username email profilePicture')
      .populate('lastMessage', 'message sender createdAt');  // Populate the lastMessage field


      res.status(200).json(personalChats);
  } catch (err) {
      res.status(500).json({ message: 'Failed to fetch personal chats', error: err });
  }
};


// Fetch group chats for a user
// In chatController.js
// chatController.js

// chatController.js

// chatController.js

// chatController.js
exports.getGroupChat = async (req, res) => {
  try {
    // Instead of finding by ID, we find the group chat by its type
    const groupChat = await Chat.findOne({ type: 'group' })
  .populate('participants', 'username email profilePicture')
  .populate('lastMessage', 'message sender createdAt');  // Populate the lastMessage field
  // Populate participants
    if (!groupChat) {
      return res.status(404).json({ message: 'Group chat not found' });
    }

    res.status(200).json(groupChat);  // Send the group chat data to the frontend
  } catch (err) {
    console.error(groupChat)
    console.error('Error fetching group chat:', err);
    res.status(500).json({ message: 'Error fetching chat', error: err });
  }
};










exports.addUserstoGroupchat = async (userId) => {
  try {
      const groupChat = await Chat.findById('64eaa9ed13649663736b0d05'); // Group chat ID
      if (!groupChat) {
          console.log('Group chat not found');
          return;
      }
      if (!groupChat.participants.includes(userId)) {
          groupChat.participants.push(userId);
          await groupChat.save();
          console.log('User added to group chat');
      }
  } catch (error) {
      console.log('Error adding user to group chat:', error);
  }
};

exports.updateGroupChatParticipants = async (user) => {
  try {
      const groupChat = await Chat.findById('64eaa9ed13649663736b0d05');
      if (!groupChat) {
          console.log('Group chat not found');
          return;
      }

      const index = groupChat.participants.findIndex((p) => p._id.equals(user._id));
      if (index !== -1) {
          groupChat.participants[index] = user;
          await groupChat.save();
          console.log('Group chat participant updated');
      }
  } catch (error) {
      console.log('Error updating group chat participants:', error);
  }
};


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://chat-notification-c4f7e.firebaseio.com"
});

// Function to send the notification using FCM v1 API
exports.sendNotification = async (token, message,username) => {
  const messagePayload = {
    token: token, // Device registration token
    notification: {
      title: `New Message from ${username}`,
      body: message
    },
    webpush: {
      headers: {
        Urgency: 'high'
      },
      notification: {
        body: message,
        requireInteraction: true,
        icon: '' // Adjust the path to your icon
      }
    }
  };

  try {
    const response = await admin.messaging().send(messagePayload);
    console.log('Successfully sent message:', response);
  } catch (error) {
    console.log('Error sending message:', error);
  }
};

