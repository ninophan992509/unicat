const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const accountModel = require("../models/account.model");
const teacherModel = require("../models/teacher.model");
const studentModel = require("../models/student.model");
const favCourseModel = require("../models/favourite-course.model");
const courseModel = require("../models/course.model");
const auth = require("../middlewares/auth.mdw");
const upload = require("../service/upload");
const deleteFile = require("../service/delete");

/* GET login page. */
router.get("/login", function (req, res) {
  if (req.headers.referer) {
    if (!req.headers.referer.toString().includes("register")) {
      req.session.retUrl = req.headers.referer;
    } else {
      req.session.retUrl = null;
    }
  }

  res.render("vwAccount/login", { layout: false });
});

router.post("/login", async function (req, res) {
  const user = await accountModel.singleByEmail(req.body.Email);
  if (user === null || +user.Role !== 2) {
    return res.render("vwAccount/login", {
      layout: false,
      err_message: "Tài khoản không tồn tại!",
    });
  }

  const ret = bcrypt.compareSync(req.body.Password, user.Password);
  if (ret === false) {
    return res.render("vwAccount/login", {
      layout: false,
      err_message: "Email hoặc mật khẩu sai!",
    });
  }

  req.session.isAuth = true;
  req.session.authUser = user.AccID;
  req.session.role = user.Role;
  req.session.cart = [];
  let url = req.session.retUrl || "/";
  res.redirect(url);
});

router.post("/logout", async function (req, res) {
  req.session.isAuth = false;
  req.session.authUser = null;
  req.session.cart = [];
  res.redirect(req.headers.referer);
});

/* GET register page. */
router.get("/register", function (req, res) {
  res.render("vwAccount/register", { layout: false });
});

router.get("/is-available", async function (req, res) {
  const email = req.query.email;
  const user = await accountModel.singleByEmail(email);

  if (user === null) {
    return res.json(true);
  }
  res.json(false);
});

router.post("/register", async function (req, res) {
  const hash = bcrypt.hashSync(req.body.Password, 10);
  const account = {
    Email: req.body.Email,
    Password: hash,
  };

  await accountModel.add(account);
  const newAccount = await accountModel.singleByEmail(req.body.Email);
  const student = {
    AccID: newAccount.AccID,
    StdName: req.body.Username,
  };
  await studentModel.add(student);

  let url = req.session.retUrl || "/account/login";
  res.redirect(url);
});

router.get("/profile", auth, async function (req, res) {
  const rows = await courseModel.allByStdID(res.locals.user.Id);
  const _rows = await courseModel.allFavByStd(res.locals.user.Id);
  res.render("vwAccount/profile", {
    myCourses: rows,
    myFavCourses: _rows,
  });
});

router.get("/edit", auth, function (req, res) {
  res.render("vwAccount/edit");
});

router.post("/edit", auth, function (req, res, next) {
  upload.single("Avatar")(req, res, async function (err) {
    if (err) {
      console.log(err);
    } else {
      // SUCCESS, image successfully uploaded
      console.log("Success, Image uploaded!");
    }
    const student = {
      StdID: +req.body.Id,
      StdName: req.body.Username,
      StdAvatar: req.file ? req.file.filename : null,
    };
    await studentModel.patch(student);
    deleteFile(`./public/images/students/${res.locals.user.Avatar}`);
  });
  res.redirect("/account/profile");
});

router.get("/security", auth, function (req, res) {
  res.render("vwAccount/security");
});

router.post("/security", auth, async function (req, res) {
  const pass = req.body.OldPw;
  const id = res.locals.authUser;
  const user = await accountModel.single(id);

  const ret = bcrypt.compareSync(pass, user.Password);
  if (ret === false) {
    res.render("vwAccount/security", {
      error: "Mật khẩu hiện tại không đúng!",
    });
  } else {
    const hash = bcrypt.hashSync(req.body.NewPw, 10);
    user.Password = hash;
    await accountModel.patch(user);
    res.redirect("/account/profile");
  }
});

router.post("/myfavourite/add", auth, async function (req, res) {
  const entity = {
    CourID: +req.body.id,
    StdID: +res.locals.user.Id,
  };
  await favCourseModel.add(entity);
  res.redirect(req.headers.referer + "#list-fav-courses");
});

router.post("/myfavourite/del", auth, async function (req, res) {
  const entity = {
    FavID: +req.body.id,
  };
  await favCourseModel.del(entity);
  res.redirect(req.headers.referer + "#list-fav-courses");
});
module.exports = router;
