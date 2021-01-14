const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const accountModel = require("../../models/account.model");
const teacherModel = require("../../models/teacher.model");
const authTeacher = require("../../middlewares/auth-teacher.mdw");

/* GET login page. */
router.get("/login", function (req, res) {
  if (req.headers.referer) {
    if (!req.headers.referer.toString().includes("register")) {
      req.session.retUrl = req.headers.referer;
    } else {
      req.session.retUrl = null;
    }
  }

  res.render("vwTeacherPages/vwAccount/login", { layout: false });
});

router.post("/login", async function (req, res) {
  const user = await accountModel.singleByEmail(req.body.Email);
  if (user === null || +user.Role !== 1) {
    return res.render("vwTeacherPages/vwAccount/login", {
      layout: false,
      err_message: "Tài khoản không tồn tại!",
    });
  }

  const ret = bcrypt.compareSync(req.body.Password, user.Password);
  if (ret === false) {
    return res.render("vwTeacherPages/vwAccount/login", {
      layout: false,
      err_message: "Email hoặc mật khẩu sai!",
    });
  }

  req.session.isAuth = true;
  req.session.authUser = user.AccID;
  req.session.role = user.Role;
  let url = req.session.retUrl || "/teacherpage/courses";
  res.redirect(url);
});

router.post("/logout", async function (req, res) {
  req.session.isAuth = false;
  req.session.authUser = null;
  res.redirect(req.headers.referer);
});

router.get("/info", async function (req, res) {
  const info_teacher = await teacherModel.single(res.locals.teacher.Id);
  info_teacher.Email = res.locals.teacher.Email;
  info_teacher.Gender =
    +info_teacher.Gender === 0
      ? "Nam"
      : +info_teacher.Gender === 1
      ? "Nữ"
      : "Khác";
  res.render("vwTeacherPages/vwAccount/profile", {
    layout: "main-teacher",
    info_teacher,
  });
});

router.post("/info/edit", function (req, res) {});
module.exports = router;
