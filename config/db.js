const mongoose = require('mongoose');

const dotenv = require('dotenv');

dotenv.config();

const connectDB = async()=>{

try{
    const conn = await mongoose.connect(process.env.connectionString)
    console.log("mongoDb is connected")
}catch(err){
    console.log("Error: " + err);
    process.exit(1);
}
}

module.exports = connectDB;