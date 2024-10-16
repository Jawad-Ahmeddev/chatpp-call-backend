// routes/chatRoute.js
const express = require('express');
const chatController = require('../controllers/chatController');
const router = express.Router();
router.get('/group', chatController.getGroupChat);

router.post('/createOrJoin', chatController.createOrJoinPersonalChat);  // Create a chat
router.get('/:chatId', chatController.getChatById);  // Get chat by ID
router.get('/:chatId/messages', chatController.getMessagesByChatId);  // Get messages for a chat
router.post('/message', chatController.sendMessage);  // Send message to a chat
router.post('/recent', chatController.getRecentChats);

// Fetch all personal chats
router.post('/personal', chatController.getAllPersonalChats);

// Fetch all group chats
module.exports = router;
