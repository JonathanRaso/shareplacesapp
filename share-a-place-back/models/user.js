const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 6 },
  image: { type: String, required: true },
  // One user can has multiple places created by himself, so we use an array here. We can store multiple places insides this places array.
  places: [{ type: mongoose.Types.ObjectId, required: true, ref: 'Place' }],    
});

// Make sure we can only create a new user if the email doesn't exist already with this uniqueValidator
userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);