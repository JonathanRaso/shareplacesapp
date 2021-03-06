const express = require('express');
const { check } = require('express-validator');

const placesControllers = require('../controllers/placesController');
const fileUpload = require('../middleware/file-upload');
const checkAuth = require('../middleware/check-auth');

const router = express.Router();

router.get('/:pid', placesControllers.getPlaceById)

router.get('/user/:uid', placesControllers.getPlacesByUserId);

// This middleware will check if there is a valid token.
// If not, the routes after this middleware will not be available for the user.
router.use(checkAuth);

router.post(
  '/',
  // Middleware for uploading image 
  fileUpload.single('image'),
  [
    check('title')
      .not()
      .isEmpty(), 
    check('description').isLength({ min: 5 }),
    check('address')
      .not()
      .isEmpty()
  ],    
  placesControllers.createPlace
);

router.patch(
  '/:pid',
  [
    check('title').not().isEmpty(),
    check('description').isLength({ min: 5 })
  ], 
  placesControllers.updatePlace
);

router.delete('/:pid', placesControllers.deletePlace);

module.exports = router;