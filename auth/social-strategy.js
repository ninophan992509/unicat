const passport = require("passport");
const FacebookStrategy = require("passport-facebook").Strategy;
const GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;
const accountModel = require("../models/account.model");
const studentModel = require("../models/student.model");
const generator = require("generate-password");
const bcrypt = require("bcryptjs");
const download = require("../service/download");

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});

passport.use(
  new FacebookStrategy(
    {
      clientID: "1047439565728058",
      clientSecret: "66523985dacbd1d786bf8709c636044c",
      callbackURL: "/auth/facebook/callback",
      profileFields: ["id", "name", "emails", "photos"],
    },
    async function (accessToken, refreshToken, profile, done) {
      try {
        let user = await accountModel.singleByFaceID(profile.id);
        if (user === null) {
          const pass = generator.generate({
            length: 8,
            lowercase: true,
            uppercase: true,
            numbers: true,
          });
          const hash = bcrypt.hashSync(pass, 10);
          user = {
            FaceID: profile.id.toString(),
            Email: profile.emails
              ? profile.emails[0].value
              : `${profile.id}@unicat.com`,
            Password: hash,
          };

          const AccID = await accountModel.add(user);

          let filename = null;
          if (profile.photos) {
            filename = profile.id.toString() + Date.now().toString() + ".jpg";
            const urlImg = "public/images/students/" + filename;
            download(profile.photos[0].value, urlImg, function () {
              console.log("done");
            });
          }

          const student = {
            AccID,
            StdName: `${profile.name.familyName} ${profile.name.givenName}`,
            StdAvatar: filename,
          };

          await studentModel.add(student);
          user.AccID = AccID;
        }

        done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

passport.use(
  new GoogleStrategy(
    {
      clientID:"716613534774-64n0dlengqtujdfbdkgam0kaa663t4bu.apps.googleusercontent.com",
      clientSecret: "TC8Ydy4mr7ZlO9QuomCRNbWl",
      callbackURL: "/auth/google/callback",
    },
    async function (accessToken, refreshToken, profile, done) {
      try {
        let user = await accountModel.singleByEmail(profile.emails[0].value);
        if (user === null) {
          const pass = generator.generate({
            length: 8,
            lowercase: true,
            uppercase: true,
            numbers: true,
          });
          const hash = bcrypt.hashSync(pass, 10);
          user = {
            Email: profile.emails
              ? profile.emails[0].value
              : `${profile.id}@unicat.com`,
            Password: hash,
          };
          const AccID = await accountModel.add(user);
          let filename = null;
          if (profile.photos) {
            filename = profile.id.toString() + Date.now().toString()+".jpg";;
            const urlImg = "public/images/students/" + filename;  
            download(profile.photos[0].value, urlImg, function () {
              console.log("done");
            });
          }

          const student = {
            AccID,
            StdName: `${profile.name.familyName} ${profile.name.givenName}`,
            StdAvatar: filename,
          };

          await studentModel.add(student);
          user.AccID = AccID;
        }

        done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

module.exports = passport;
