const fetch = require('node-fetch');
const express = require('express');
const bodyParser = require('body-parser');
const User = require('../models/user');
const router = express.Router();
const authenticate = require('../authenticate');
const config = require('../config');

router.use(bodyParser.json());

/* GET User listing. */
router.get('/', (req, res, next) => {
  User.find({}).then(users => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(users);
  }, err => next(err))
  .catch(err => next(err));
})

/* DELETE Users */
router.delete('/', (req, res, next) => {
  User.findByIdAndDelete({ _id: req.body.target }, (err, user) => {
    if (err) throw err;
    else if (!user) {
      res.statusCode = 401;
      res.json('Not found!');
    }
    else {
      res.statusCode = 200;
      res.json({deleted: user});
    };
  });
});

/* Find or create the user */
async function findOrCreateUser(we_res_openid, cb) {
  User.findOne({open_id: we_res_openid}, (err, user) => {
    if (err) throw err;
    else if (!user) {
      console.log('user does not exist');
      User.create({ open_id: we_res_openid }, (err, newUser) => {
        if (!err) {
          console.log(newUser);
          cb(newUser);
        }
        else throw err;
      });
    }
    else if (user) {
      cb(user);
    };
  });
};

/* retrieve openid and session_key */
router.post('/code', (req, res, next) => {
  const url = "https://api.weixin.qq.com/sns/jscode2session?appid=" + config.appId +
    "&secret=" + config.appSecret + "&js_code=" + req.body.code + "&grant_type=authorization_code";

  fetch(url, { method: 'GET' }).then((we_res) => {
    we_res.text().then((we_res_text) => {
      const we_res_openid = JSON.parse(we_res_text)['openid'];
      findOrCreateUser(we_res_openid, (user) => {
        let token = authenticate.getToken({_id: user._id});
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({userInfo: user['user_info'], points: user['points'], token: token});
      });
    });
  }).catch(err => console.log(err));
});

/* Register user information for account */
router.post('/registerinfo', authenticate.verifyUser, (req, res, next) => {
  User.findById(req.user._id).select('-open_id -admin')
  .then((user) => {
    if (user) {
      user.user_info = req.body.userInfo;
      user.save((err, user) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(user);
      });
    }
    else {
      res.statusCode = 401;
      let err = new Error('Account not found!')
      throw err;
    }
  }, err => {throw err})
  .catch(err => console.log(err));
});

module.exports = router;
