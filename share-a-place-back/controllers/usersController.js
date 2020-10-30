const { validationResult } = require('express-validator');

const HttpError = require('../models/http-error');
const User = require('../models/user');

const getUsers = async (req, res, next) => {

  let users;
  try {
    // We find every users inside our DB, but we don't want to return their password, so we use '-password' to exclude this property from our query
    users = await User.find({}, '-password');
  } catch (err) {
    const error = new HttpError('Fetching users failed, please try again later', 500);
    return next(error);
  }

  // We get an array here, so we have to map through this array in order to use the .toObject method
  res.status(200).json({ users: users.map(user => user.toObject({ getters: true })) });
};

const signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError('Invalid input for signup, please check your data', 422)
    );
  }

  const { name, email, password } = req.body;

  let existingUser
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError('Signing up failed, please try again.', 500);
    return next(error);
  }
 

  if (existingUser) {
    const error = new HttpError('User exists already, please try again.', 422);
    return next(error);
  }
   
    const createdUser = new User ({
      name,
      email,
      image: req.file.path,
      password,
      places: []
    });

    try {
      await createdUser.save();
    } catch (err) {
      const error = new HttpError('Signing up failed, please try again.', 500);
      return next(error);
    }

    res.status(201).json({user: createdUser.toObject({ getters: true })}); 
  } 

const login = async (req, res, next) => {
  const { email, password } = req.body;

  let identifiedUser;

  try {
    identifiedUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError('Logging in failed, please try again later.', 401);
    return next(error);
  }

  if (!identifiedUser || identifiedUser.password !== password) {
    const error = new HttpError('Invalid credentials, could not log you in.', 401);
    return next(error);
  }

  res.status(200).json({
    message: 'Logged in!', 
    user: identifiedUser.toObject({ getters: true })
  });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;