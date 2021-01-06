const teacherModel = require("../models/teacher.model");
const accountModel = require("../models/account.model");

module.exports = function (app) {
  app.use(async function (req, res, next) {
    if (typeof req.session.isAuth === "undefined") {
      req.session.isAuth = false;
    }

    res.locals.isAuth = req.session.isAuth;
    res.locals.authUser = req.session.authUser;

    if (req.session.isAuth && req.session.authUser) {
      const AccID = req.session.authUser;
      const account = await accountModel.single(AccID);
      if (+account.Role === 1) {
        const teacher = await teacherModel.singleByAccID(account.AccID);
        const user = {
          Id: teacher.TeachID,
          Email: account.Email,
          Username: teacher.TeachName,
          Avatar: teacher.TeachAvatar,
        };
        res.locals.teacher = user;
      }
    }
    next();
  });
};
