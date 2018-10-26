const User = require('./models/user');
const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const jwt = require('jsonwebtoken');
const config = require('./config');
const bcrypt = require('bcrypt');

const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.secretKey;

exports.jwtPassport = passport.use(new JwtStrategy(opts, (jwt_payload, done) => {
  console.log('JWT Payload is: ' + jwt_payload);
  User.findOne({ _id: jwt_payload._id }, (err, user) => {
    if (err) return done(err, null);
    else if (user) {
      return done(null, user);
    }
    else {
      let err = new Error('User not found');
      err.status = 401;
      return done(err, false);
    }
  });
}));

exports.verifyUser = passport.authenticate('jwt', {session: false});

exports.getToken = function(user) {
  return jwt.sign(user, config.secretKey);
}



