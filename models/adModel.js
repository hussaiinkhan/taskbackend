const mongoose = require('mongoose');

const AdSchema = new mongoose.Schema({
  user_id:{
    type : mongoose.Schema.Types.ObjectId,
    required : true,
    ref : "Admin"        // this will associate the contacts created by a user to that particular user not all users
},
  ad_title: { type: String, required: true },
  area: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
  },
  description: { type: String, required: true },
  price:{type: Number, require:true},
  is_rent: { type: String, default: 'false' },
  image: { type: String, required:true },
});

module.exports = mongoose.model('Ad', AdSchema);
