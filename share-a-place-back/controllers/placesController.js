const fs = require('fs');

const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

const HttpError = require('../models/http-error');
const getCoordsForAddress = require('../util/location');
const Place = require('../models/place');
const User = require('../models/user');


const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid;

  let place; 

  try {
    place = await Place.findById(placeId);
  } catch (err) {
    const error = new HttpError('Something went wrong, could not find a place.', 500);
    return next(error);
  }

  if (!place) {
    // We can use throw or next() in a sync function. But we need to use next() if we are in async function
    // This error will trigger our error handling middleware
    // With throw, we don't have to return because it already cancels the function execution
    const error = new HttpError('Could not find a place for the provided id.', 404);
    return next(error);
  }

  res.json({ place: place.toObject( { getters: true } ) }); // => { place: place } / { getters: true } => used to get rid of the '_' with _id. Mongoose add an id property to the created object
};

const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid;
  
  // let places;
  let userWithPlaces
  try {
    userWithPlaces = await User.findById(userId).populate('places');
  } catch (err) {
    const error = new HttpError('Fetching places failed, please try again later.', 500);
    return next(error);
  }

  // if (!places || places.places.length === 0) {
  if (!userWithPlaces || userWithPlaces.places.length === 0) {
    // We can use throw or next() in a sync function. But we need to use next() if we are in async function
    // This error will trigger our error handling middleware
    // Don't forget to return, or the other response will be sent and it's not possible to send 2 responses
    const error = new HttpError('Could not find places for the provided user id.', 404);
    return next(error);
  }

  // It's an array here, so we have to map on it, and not use toObject like in the getPlacesById method /{ getters: true } => used to get rid of the '_' with _id. Mongoose add an id property to the created object
  res.json({ places: userWithPlaces.places.map((place) => place.toObject( { getters: true } )) });
};

const createPlace = async (req, res, next) => {
  // Look into the request object and see if there are any validations error based on the config inside place-routes.js
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError('Invalid inputs passed, please check your data.', 422));
  }

  const { title, description, address } = req.body; 

  let coordinates;
  try {
    coordinates = await getCoordsForAddress(address);
  } catch (error) {
    return next(error);
  }

  const createdPlace = new Place({
    title,
    description,
    address,
    location: coordinates,
    image: req.file.path,
    creator: req.userData.userId //We extract this info from the check-auth middleware
  });

  let user;
  try {
    user = await User.findById(req.userData.userId);
  } catch (err) {
    const error = new HttpError('Creating place failed, please try again', 500);
    return next(error);
  }

  if (!user) {
    const error = new HttpError('Could not find user for provided id', 404);
    return next (error);
  }

  console.log(user);

  // Save the new created place inside our database
  try {
    // Part 1 => Start session and Store the place
    // With transaction, you can't create new collection on the fly, so we need to create it inside mongodb before creating new place or new user
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdPlace.save({ session: sess});
    // Part 2 => Make sure the place id is also added to the user, with mongoose method .push
    user.places.push(createdPlace);
    await user.save({ session: sess });
    // The changes in the database are only saved at this point (sess.commitTransaction()). If anything gone wrong before this point, all changes would have been rollbacked
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError('Creating place failed, please try again.', 500);
    return next(error);
  }

  res.status(201).json({place: createdPlace});
};

const updatePlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return next (new HttpError('Invalid inputs passed for updating place, please check your data', 422));
  }

  const { title, description } = req.body;
  const placeId = req.params.pid;
  
  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    const error = new HttpError('Something went wrong, could not update place.', 500);
    return next(error); 
  }

  // We need to check if the user who wants to update the place is the creator of this place
  // req.userData.userId comes from check-auth.js, and we can compare if the userId inside the token is the same as the id of the creator of the place
  // place.creator is of type mongoose.objectId, and req.userData.userId is a string. So we need to convert it in order to check if these two datas are the same
  if (place.creator.toString() !== req.userData.userId) {
    const error = new HttpError('You are not allowed to edit this place.', 401);
    return next(error); 
  }

  place.title = title;
  place.description = description;

  try {
    await place.save();
  } catch (err) {
    const error = new HttpError('Updating place failed, please try again.', 500);
    return next(error);
  }

  res.status(200).json({ place: place.toObject({ getters: true }) });
};

const deletePlace = async (req, res, next) => {
  const placeId = req.params.pid;

  let place;
  try {
    // Thanks to .populate('creator'), it gaves us access to the full user object linked to that place
    place = await Place.findById(placeId).populate('creator');
  } catch (err) {
    const error = new HttpError('Somehting went wrong, could not delete place.', 500);
    return next(error);
  }

  
  if (!place) {
    const error = new HttpError('Could not find place for this id.', 404);
    return next(error);
  }

  // We need to check if the user who wants to delete the place is the creator of this place.
  // req.userData.userId comes from check-auth.js, and we can compare if the userId inside the token is the same as the id of the creator of the place.
  // place.creator.id is an object with full details of the creator (thanks to .populate('creator')), so we don't need to convert it like in the updatePlace method.
  if (place.creator.id !== req.userData.userId) {
    const error = new HttpError('You are not allowed to delete this place.', 401);
    return next(error); 
  }

  const imagePath = place.image;

  try {
    // Part 1 => Start session and delete the place
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await place.remove({ session: sess });
    // Part 2 => Make sure the place id is also removed from the user, with mongoose method .pull
    place.creator.places.pull(place);
    await place.creator.save({ session: sess});
     // The changes in the database are only saved at this point (sess.commitTransaction()). If anything gone wrong before this point, all changes would have been rollbacked
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError('Something went wrong, could not delete place.', 500);
    return next(error);
  }

  // Delete the image from our uploads/images folder
  fs.unlink(imagePath, (err) => {
    console.log(err);
  });

  res.status(200).json({ message: 'Deleted place.' });
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
