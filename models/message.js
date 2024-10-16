const mongoose = require ('mongoose');

const messagesSchema = new mongoose.Schema({
    chat: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat' },  // Reference to the chat
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },  // Reference to the sender
    message: { type: String, required: true },  // The message text
    createdAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['sent', 'delivered', 'read'], default: 'sent' },

  });

module.exports = mongoose.model('Message', messagesSchema)