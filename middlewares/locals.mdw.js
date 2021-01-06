const categoryModel = require("../models/category.model");
const fieldModel = require("../models/field.model");
const teacherModel = require("../models/teacher.model");
const studentModel = require("../models/student.model");
const accountModel = require("../models/account.model");
const favCourseModel = require("../models/favourite-course.model");
const cartModel = require("../models/cart.model");

module.exports = function (app) {
  app.use(async function (req, res, next) {
    if (typeof req.session.isAuth === "undefined") {
      req.session.isAuth = false;
      req.session.cart = [];
    }

    res.locals.isAuth = req.session.isAuth;
    res.locals.authUser = req.session.authUser;
    res.locals.cartSummary = cartModel.getNumberOfItems(req.session.cart);

    if (req.session.isAuth && req.session.authUser) {
      const AccID = req.session.authUser;
      const account = await accountModel.single(AccID);
      if (+account.Role === 2) {
        const student = await studentModel.singleByAccID(account.AccID);
        const favCourses = await favCourseModel.allByStdID(student.StdID);
        const user = {
          Id: student.StdID,
          Email: account.Email,
          Username: student.StdName,
          Avatar: student.StdAvatar,
        };
        res.locals.user = user;
        res.locals.lcFavourite = favCourses;
      }
    }

    next();
  });

  app.use(async function (req, res, next) {
    const rows = await categoryModel.all();
    rows.forEach(async (row) => {
      row.Fields = await fieldModel.allFieldOfCategory(row);
    });
    res.locals.lcCategories = rows;
    next();
  });
};
