const express = require('express');
const bodyParser = require('body-parser');
const authenticate = require('../authenticate');
const Restaurants = require('../models/restaurant');
const Dishes = require('../models/dishes');
const dishRouter = require('../routes/dishRouter');

const restaurantRouter = express.Router();

restaurantRouter.use(bodyParser.json());

/* localhost:3000/restaurants/ */
restaurantRouter.route('/')
  .get((req, res, next) => {
    Restaurants.find({})
      .then((restaurants) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(restaurants);
      }, (err) => next(err))
      .catch((err) => next(err));
  })
  .post(authenticate.verifyUser, (req, res, next) => {
    Restaurants.create(req.body)
      .then((restaurant) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(restaurant);
      }, (err) => next(err))
      .catch((err) => next(err));
  })
  .put(authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on this endpoint');
  })
  .delete(authenticate.verifyUser, (req, res, next) => {
    Restaurants.remove({})
      .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
      }, (err) => next(err))
      .catch((err) => next(err));
  });

/* localhost:3000/restaurants/:restaurantId */
restaurantRouter.route('/:restaurantId')
  .get((req, res, next) => {
    Restaurants.findById(req.params.restaurantId)
      .populate('dishes')
      .then((restaurant) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(restaurant);
      }, (err) => next(err))
      .catch((err) => next(err));
  })
  .post(authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('POST operation not accepted on this endpoint!');
  })
  .put(authenticate.verifyUser, (req, res, next) => {
    Restaurants.findByIdAndUpdate(req.params.restaurantId, {
      $set: req.body
    }, { new: true })
    .then((restaurant) => {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(restaurant);
    }, (err) => next(err))
    .catch((err) => next(err));
  })
  .delete(authenticate.verifyUser, (req, res, next) => {
    Restaurants.findByIdAndDelete(req.params.restaurantId)
    .then((resp) => {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
  });

/* THIS IS THE ONLY EXCEPTION!!!!! IT ONLY WORKS WITH REQ.PARAMS.RESTAURANTID!!!! */
restaurantRouter.route('/:restaurantId/dishes')
  .get((req, res, next) => {
    Dishes.find({ restaurant: req.params.restaurantId })
      .then((dishes) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        /// fix: this cant include the comments
        res.json(dishes);
      }, (err) => next(err))
      .catch((err) => next(err));
  })
  .post(authenticate.verifyUser, (req, res, next) => {
    req.body.restaurant = req.params.restaurantId;
    Dishes.create(req.body)
      .then((dish) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(dish);
      }, (err) => next(err))
      .catch((err) => next(err));
  })
  .put(authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on this endpoint');
  })
  .delete(authenticate.verifyUser, (req, res, next) => {
    Dishes.remove({ restaurant: req.params.restaurantId })
      .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
      }, (err) => next(err))
      .catch((err) => next(err));
  });

restaurantRouter.use('/:restaurantId/dishes', dishRouter);

module.exports = restaurantRouter;
