const adminModel = require("../models/admin.model");
const accountModel = require("../models/account.model");

module.exports = function (app) {
  app.use(async function (req, res, next) {
    if (typeof req.session.isAuth === "undefined") {
      req.session.isAuth = false;
    }

    res.locals.isAuth = req.session.isAuth;
    res.locals.authUser = req.session.authUser;

    if (req.session.isAuth && req.session.authUser && req.session.role === 0) {

      const AccID = req.session.authUser;
      const account = await adminModel.single(AccID);
      if (account !== null) {
        const user = {
          Id: account.AccID,
          Email: account.Email,
          Username: account.Name,
          Avatar: account.Avatar,
        };
        res.locals.admin = user;
      }
    }
    next();
  });
};
