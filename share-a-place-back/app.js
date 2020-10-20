const express = require('express');
const bodyParser = require('body-parser');

const placesRoutes = require('./routes/places-routes');
const HttpError = require('./models/http-error');

const app = express();

// This middleware will parse any incoming request body and extract any json data inside, converted to regular javascript and call next.
// We will find this data inside req.body
app.use(bodyParser.json());

app.use('/api/places', placesRoutes);

// Error handling for unsupported routes
app.use((req, res, next) => {
  const error = new HttpError('Could not find this route.', 404);
  throw error;
});

// Error handling middleware function. Will only be executed on requests that have an error attached to it
app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || 'An unknown error occured!' });
});

app.listen(5000);