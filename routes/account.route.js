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
const email = require("../service/email");
const generator = require("generate-password");

router.get("/login", function (req, res) {
  if (req.headers.referer) {
    if (
      !req.headers.referer.toString().includes("register") &&
      !req.headers.referer.toString().includes("login")
    ) {
      req.session.retUrl = req.headers.referer;
    } else {
      req.session.retUrl = "/";
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

  if(user.isLock){
     return res.render("vwAccount/login", {
       layout: false,
       err_message: "Tài khoản của bạn đang bị khóa!",
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

  const AccID = await accountModel.add(account);
  const code = generator.generate({
    length: 8,
    lowercase: true,
    uppercase: true,
    numbers: true,
  });

  const student = {
    AccID,
    StdName: req.body.Username,
    ActiveCode: code,
  };

  await studentModel.add(student);

  const mailOptions = {
    from: process.env.EMAIL,
    to: req.body.Email,
    subject: "Unicat - Your Email Confirmation Code",
    html: `<h1>Thanks for your registration!</h1><p>This is your active code: <span>${code}</span></p>`,
  };

  email(mailOptions);

  req.session.isAuth = true;
  req.session.authUser = AccID;
  req.session.role = 2;
  req.session.cart = [];
  res.redirect("/account/active");
});

router.get("/active", function (req, res) {
  res.render("vwAccount/confirm");
});

router.post("/active", async function (req, res) {
  const student = await studentModel.single(+res.locals.user.Id);
  if (student && student.ActiveCode === req.body.code) {
    const entity = {
      ActiveCode: null,
      StdID: student.StdID,
    };
    await studentModel.patch(entity);
    res.redirect("/");
  } else {
    res.render("vwAccount/confirm", {
      error: "Mã xác nhận không đúng. Vui lòng kiểm tra lại!",
    });
  }
});

router.get("/profile", auth, async function (req, res) {
  try {
    const rows = await courseModel.allByStdID(res.locals.user.Id);
    const _rows = await courseModel.allFavByStd(res.locals.user.Id);
    res.render("vwAccount/profile", {
      myCourses: rows,
      myFavCourses: _rows,
    });
  } catch (error) {
    throw error;
  }
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
    if (res.locals.user.Avatar !== null)
      deleteFile(`./public/images/students/${res.locals.user.Avatar}`);
  });
  res.redirect("/account/profile");
});

router.get("/security", auth, function (req, res) {
  res.render("vwAccount/security");
});

router.post("/security", auth, async function (req, res) {
  const pass = req.body.OldPw;
  const id = req.session.authUser;
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
