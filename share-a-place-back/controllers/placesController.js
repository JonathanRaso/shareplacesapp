const { uuid } = require('uuidv4');

const HttpError = require('../models/http-error');

const DUMMY_PLACES = [
  {
    id: 'p1',
    title: 'Empire State Building',
    description: 'One of the most famous sky scrapers in the world!',
    location: {
      lat: 40.7484474,
      lng: -73.9871516
    },
    address: '20 W 34th St, New York, NY 10001',
    creator: 'u1'
  }
];

const getPlaceById = (req, res, next) => {
  const placeId = req.params.pid;
  const place = DUMMY_PLACES.find((place) => place.id === placeId);

  if (!place) {
    // We can use throw or next() in a sync function. But we need to use next() if we are in async function
    // This error will trigger our error handling middleware
    // With throw, we don't have to return because it already cancels the function execution
    throw new HttpError('Could not find a place for the provided id.', 404);
  }

  res.json({ place }); // => { place: place }
};

const getPlaceByUserId = (req, res, next) => {
  const userId = req.params.uid;
  const place = DUMMY_PLACES.find((place) => place.creator === userId);

  if (!place) {
    // We can use throw or next() in a sync function. But we need to use next() if we are in async function
    // This error will trigger our error handling middleware
    // Don't forget to return, or the other response will be sent and it's not possible to send 2 responses
    return next(new HttpError('Could not find a place for the provided user id.', 404));
  }

  res.json({ place }); // => { place: place }
};

const createPlace = (req, res, next) => {
  const { title, description, coordinates, address, creator } = req.body; 

  const createdPlace = {
    id: uuid(),
    title,
    description,
    location: coordinates,
    address,
    creator
  };

  DUMMY_PLACES.push(createPlace);

  res.status(201).json({place: createdPlace});
};

exports.getPlaceById = getPlaceById;
exports.getPlaceByUserId = getPlaceByUserId;
exports.createPlace = createPlace;