// Using nominatim API for lat and lng instead of google geocode (free API/no need to have an account)

const axios = require('axios');

const HttpError = require('../models/http-error');

const getCoordsForAddress = async (address) => {
  let lat;
  let lng;

  const response = await axios.get(
    `https://nominatim.openstreetmap.org/?addressdetails=1&q=${address}&format=json&limit=1`
  )
  
  const data = response.data;

  if (!data || data.status === 'ZERO_RESULTS') {
    const error = new HttpError('Could not find location for the specified address.', 422);
    throw error;
  }

  lat = response.data[0].lat;
  lng = response.data[0].lon;

  const coordinates = {
    lat,
    lng
  };  
  console.log(coordinates);

  return coordinates;
};

module.exports = getCoordsForAddress;

