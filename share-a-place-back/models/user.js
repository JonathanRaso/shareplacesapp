const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 6 },
  image: { type: String, required: true },
  places: { type: String, requireed: true },    
});

// Make sure we can only create a new user if the email doesn't exist already with this uniqueValidator
userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);