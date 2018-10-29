const express = require('express');
const bodyParser = require('body-parser');
const Dishes = require('../models/dishes');
const authenticate = require('../authenticate');

const dishRouter = express.Router();

dishRouter.use(bodyParser.json());

/* localhost:3000/restaurants/:restaurantId/dishes/:dishId */
dishRouter.route('/:dishId')
  .get((req, res, next) => {
    Dishes.findById(req.params.dishId)
      .then((dish) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(dish);
      }, (err) => next(err))
      .catch((err) => next(err));
  })
  .post(authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on this endpoint!');
  })
  .put(authenticate.verifyUser, (req, res, next) => {
    Dishes.findByIdAndUpdate(req.params.dishId, {
      $set: req.body
    }, { new: true })
      .then((dish) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(dish);
      }, (err) => next(err))
      .catch((err) => next(err));
  })
  .delete(authenticate.verifyUser, (req, res, next) => {
    Dishes.findByIdAndRemove(req.params.dishId)
      .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
      }, (err) => next(err))
      .catch((err) => next(err));
  });

/* localhost:3000/restaurants/:restaurantId/dishes/:dishId/comments */
dishRouter.route('/:dishId/comments')
  .get((req, res, next) => {
    Dishes.findById(req.params.dishId)
      .populate('comments.author')
      .then((dish) => {
        if (dish) {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(dish.comments);
        }
        else {
          err = new Error('There are no comments on: ' + req.params.dishId);
          err.status = 404;
          return next(err);
        }
      }, (err) => next(err))
      .catch((err) => next(err));
  })
  .post(authenticate.verifyUser, (req, res, next) => {
    Dishes.findById(req.params.dishId)
      .then((dish) => {
        if (dish) {
          req.body.author = req.user._id;
          dish.comments.push(req.body);
          dish.save()
            .then((dish) => {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.json(dish);
            }, (err) => next(err));
        }
        else {
          err = new Error('Dish' + req.params.dishId + ' not found');
          err.status = 404;
          return next(err);
        }
      }, (err) => next(err))
      .catch((err) => next(err));
  })
  .put(authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on this endpoint!');
  })
  .delete(authenticate.verifyUser, (req, res, next) => {
    Dishes.findById(req.params.dishId)
      .then((dish) => {
        if (dish) {
          for (let i = (dish.comments.length - 1); i >= 0; i--) {
            dish.comments.id(dish.comments[i]._id).remove();
          }
          dish.save()
          .then((dish) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(dish);
          }, (err) => next(err));
        }
        else {
          err = new Error('Dish' + req.params.dishId + ' not found');
          err.status = 404;
          return next(err);
        }
      }, (err) => next(err))
      .catch((err) => next(err));
  });

/* localhost:3000/restaurants/:restaurantId/dishes/:dishId/comments/:commentId */
dishRouter.route('/:dishId/comments/:commentId')
  .get((req, res, next) => {
    Dishes.findById(req.params.dishId)
      .populate('comments.author')
      .then((dish) => {
        if (dish && dish.comments.id(req.params.commentId)) {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(dish.comments.id(req.params.commentId));
        }
        else if (!dish) {
          err = new Error('Dish' + req.params.dishId + ' not found');
          err.status = 404;
          return next(err);
        }
        else {
          err = new Error('Comment' + req.params.commentId + ' not found');
          err.status = 404;
          return next(err);
        }
      }, (err) => next(err))
      .catch((err) => next(err));
  })
  .post(authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on this endpoint!');
  })
  .put(authenticate.verifyUser, (req, res, next) => {
    Dishes.findById(req.params.dishId)
      .then((dish) => {
        if ((dish && dish.comments.id(req.params.commentId)) && req.user._id.equals(dish.comments.author)) {
          if (req.body.rating) {
            dish.comments.id(req.params.commentId).rating = req.body.rating
          }
          if (req.body.comment) {
            dish.comments.id(req.params.commentId).comment = req.body.comment
          }
          dish.save()
            .then((dish) => {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.json(dish);
            }, (err) => next(err));
        }
        else if (!dish) {
          err = new Error('Dish' + req.params.dishId + ' not found');
          err.status = 404;
          return next(err);
        }
        else if (dish.comments.id(req.params.commentId) == null) {
          err = new Error('Comment' + req.params.commentId + ' not found');
          err.status = 404;
          return next(err);
        }
        else {
          err = new Error('You are not permitted to commit this action');
          err.status = 404;
          return next(err);
        }
      }, (err) => next(err))
      .catch((err) => next(err));
  })
  .delete(authenticate.verifyUser, (req, res, next) => {
    Dishes.findById(req.params.dishId)
      .then((dish) => {
        if (dish && dish.comments.id(req.params.commentId)) {
          dish.comments.id(req.params.commentId).remove();
          dish.save()
            .then((dish) => {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.json(dish);
            }, (err) => next(err));
        }
        else if (!dish) {
          err = new Error('Dish' + req.params.dishId + ' not found');
          err.status = 404;
          return next(err);
        }
        else if (!dish.comments.id(req.params.commentId)) {
          err = new Error('Comment' + req.params.commentId + ' not found');
          err.status = 404;
          return next(err);
        }
        else {
          err = new Error('You are not permitted to commit this action');
          err.status = 404;
          return next(err);
        }
      }, (err) => next(err))
      .catch((err) => next(err));
  });

module.exports = dishRouter;