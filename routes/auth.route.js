const express = require('express');
const passport = require('../auth/social-strategy');
const router = express.Router();

router.get('/facebook',passport.authenticate('facebook',{ scope: ['email']}));

router.get('/facebook/callback', passport.authenticate('facebook', {
    failureRedirect: '/account/login',}),
  (req, res) => {
      
    req.session.isAuth = true;
    req.session.authUser = req.user.AccID;
    res.redirect('/');
  }
);

router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email'],
  })
);

router.get('/google/callback', passport.authenticate('google', {
    failureRedirect: '/account/login',
  }),
  (req, res) => {
      
      req.session.isAuth = true;
      req.session.authUser = req.user.AccID;
    res.redirect('/');
  }
);

module.exports = router;