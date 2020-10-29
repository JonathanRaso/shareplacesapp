const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

const placesRoutes = require('./routes/places-routes');
const usersRoutes = require('./routes/users-routes');
const HttpError = require('./models/http-error');


const app = express();

// Use this for database credentials inside process.env, thanks to the dotenv package.
dotenv.config();

// This middleware will parse any incoming request body and extract any json data inside, converted to regular javascript and call next.
// We will find this data inside req.body
app.use(bodyParser.json());

// This middleware will add header to every response, in order to take care of CORS issues
app.use((req, res, next) => {
  // '*' give access to any domain
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
  next();
});

app.use('/api/places', placesRoutes);
app.use('/api/users', usersRoutes);

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

mongoose
  .connect(`mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.jvpwi.mongodb.net/${process.env.DB_DBNAME}?retryWrites=true&w=majority`)
  .then(() => {
    app.listen(5000);
    console.log('Connection to database Done!')
  })
  .catch((err) => {
    console.log(error);  
  });

  /* app.listen(5000);
  console.log(process.env.DB_USERNAME, process.env.DB_PASSWORD, process.env.DB_DBNAME); */
