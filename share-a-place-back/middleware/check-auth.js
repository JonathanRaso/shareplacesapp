const jwt = require('jsonwebtoken');

const HttpError = require("../models/http-error");

module.exports = (req, res, next) => {
  try {
    // Get the token from the header of our request. Authoziration: 'Bearer TOKEN'
    const token = req.headers.authorization.split(' ');[1] // [0] => Bearer, [1] => TOKEN
    if (!token) {
      throw new Error('Authentication failed!', 401);
    }
    // decodedToken will be the payload encoded in the token, not a boolean. If verification doesn't failed, we can let the request continue with next().
    // If verification failed, it will throw an error and we go to the catch block
    const decodedToken = jwt.verify(token, 'supersecret_dont_share');
    // Add userData with infos about user, inside the request
    req.userData = { userId: decodedToken.userId }
    next();
  } catch (err) {
    const error = new HttpError('Authentication failed!', 401);
    return next(error);
  }
};