const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const app = express();
const messageRoute = require('./routes/messageRoute');

const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: 'http://localhost:4200', // Replace with your Angular app URL
        methods: ['GET', 'POST'],
        credentials: true
    }
});
app.use(cors({
    origin: 'http://localhost:4200', // Replace with your Angular app's URL
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // Allow cookies to be sent with requests
}));

app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoute'));
app.use('/api/chats', require('./routes/chatRoute'));
app.use('/api/messages', messageRoute);

require('./socket/chatSocket')(io);

const connectDb = require('../backend/config/db')
connectDb();
const port = process.env.PORT || 3001;

server.listen(port, () => {
    console.log("The server is running on port " + port);
});
