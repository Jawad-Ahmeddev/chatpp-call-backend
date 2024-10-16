// routes/messageRoute.js
const express = require('express');
const messageController = require('../controllers/messageController');
const router = express.Router();

router.get('/getmessage/:chatId', messageController.getMessages);  // Get messages by chatId
router.post('/send', messageController.sendMessage);  // Send a message

module.exports = router;
