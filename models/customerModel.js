const mongoose = require('mongoose');

const CustomerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  surname: { type: String, required: true },
  budget: { type: Number, required: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

module.exports = mongoose.model('Customer', CustomerSchema);
