const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  username: {
    index:true,
    type: String
  },
  email: {
    type: String,
    trim: true,
    required: true,
    unique:true
  },
  email_is_verified:{
      type:Boolean,
      default:false
  },
  password:{
      type:String
  },
  uniqueIDsWatching: {
    type: Array
  }},
  {strict: false}
);

module.exports = User = mongoose.model('users', UserSchema)
