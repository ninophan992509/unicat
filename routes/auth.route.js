const express = require("express");
const passport = require("../auth/social-strategy");
const router = express.Router();
const handle_session = require("../service/handle-student-session");

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
     handle_session(req,res);
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
     handle_session(req, res);
  }
);

module.exports = router;
