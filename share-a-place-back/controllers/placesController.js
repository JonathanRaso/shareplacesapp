const { uuid } = require('uuidv4');
const { validationResult } = require('express-validator');

const HttpError = require('../models/http-error');
const getCoordsForAddress = require('../util/location');
const Place = require('../models/place');

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
  
  let places;

  try {
    places = await Place.find({ creator: userId });
  } catch (err) {
    const error = new HttpError('Fetching places failed, please try again later.', 500);
    return next(error);
  }

  if (!places || places.length === 0) {
    // We can use throw or next() in a sync function. But we need to use next() if we are in async function
    // This error will trigger our error handling middleware
    // Don't forget to return, or the other response will be sent and it's not possible to send 2 responses
    const error = new HttpError('Could not find places for the provided user id.', 404);
    return next(error);
  }

  res.json({ places: places.map((place) => place.toObject( { getters: true } )) }); // it's an array here, so we have to map on it, and not use toObject like in the getPlacesById method /{ getters: true } => used to get rid of the '_' with _id. Mongoose add an id property to the created object
};

const createPlace = async (req, res, next) => {
  // Look into the request object and see if there are any validations error based on the config inside place-routes.js
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return next(new HttpError('Invalid inputs passed, please check your data.', 422));
  }

  const { title, description, address, creator } = req.body; 

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
    image: 'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwww.eschoolnews.com%2Ffiles%2F2014%2F08%2Fonline_testing.3.jpg&f=1&nofb=1',
    creator
  });

  // Save the new created place inside our database
  try {
    await createdPlace.save();
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
    place = await Place.findById(placeId);
  } catch (err) {
    const error = new HttpError('Could not find a place for that id.', 404);
    return next(error);
  }

  try {
    await place.remove();
  } catch (err) {
    const error = new HttpError('Something went wrong, could not delete place.', 404);
    return next(error);
  }

  res.status(200).json({ message: 'Deleted place.' });
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
