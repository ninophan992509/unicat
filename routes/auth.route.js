const express = require("express");
const passport = require("../auth/social-strategy");
const router = express.Router();

router.get(
  "/facebook",
  passport.authenticate("facebook", { scope: ["email"] })
);

router.get(
  "/facebook/callback",
  passport.authenticate("facebook", {
    failureRedirect: "/account/login",
  }),
  (req, res) => {
    req.session.isAuth = true;
    req.session.authUser = req.user.AccID;
    req.session.role = req.user.Role;
    req.session.cart = [];
    let url = req.session.retUrl || "/";
    res.redirect(url);
  }
);

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/account/login",
  }),
  (req, res) => {
    req.session.isAuth = true;
    req.session.authUser = req.user.AccID;
    req.session.role = req.user.Role;
    req.session.cart = [];
    let url = req.session.retUrl || "/";
    res.redirect(url);
  }
);

module.exports = router;
