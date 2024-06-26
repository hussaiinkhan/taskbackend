const mongoose = require('mongoose');
const config = require('./config');

const connectDB = async () => {
  try {
     const connect = await mongoose.connect(config.mongoURI);
    console.log('Database Connected',connect.connection.host,connect.connection.name);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
