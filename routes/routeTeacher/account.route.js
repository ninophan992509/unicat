const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const accountModel = require("../../models/account.model");
const teacherModel = require("../../models/teacher.model");
const authTeacher = require("../../middlewares/auth-teacher.mdw");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const deleteFile = require("../../service/delete");

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

router.get("/info", authTeacher, async function (req, res) {
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

router.get("/info/edit", authTeacher, async function (req, res) {
  const info_teacher = await teacherModel.single(res.locals.teacher.Id);
  info_teacher.Email = res.locals.teacher.Email;
  res.render("vwTeacherPages/vwAccount/edit", {
    layout: "main-teacher",
    info_teacher,
  });
});

let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = "./public/images/teachers/";
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + Date.now() + path.extname(file.originalname));
  },
});

router.post(
  "/info/edit",
  authTeacher,
  multer({ storage }).any(),
  async function (req, res) {
    try {
      const entity = {
        TeachID: +res.locals.teacher.Id,
        TeachName: req.body.username,
        Phone: req.body.phone,
        SubEmail: req.body.sub_email,
        TeachInfo: req.body.teach_info,
        Gender: +req.body.gender,
        DateOfBirth: req.body.birth,
      };
      if (req.files.length > 0) {
        entity.TeachAvatar = req.files[0].filename;
        if (res.locals.teacher.Avatar !== null)
          deleteFile(`./public/images/teachers/${res.locals.teacher.Avatar}`);
      }
      await teacherModel.patch(entity);
      res.redirect("/teacherpage/info");
    } catch (error) {
      throw error;
    }
  }
);

router.get("/info/security", authTeacher, function (req, res) {
  res.render("vwTeacherPages/vwAccount/security", {
    layout: "main-teacher",
    title: "Đổi mật khẩu",
  });
});

router.post("/info/security", authTeacher, async function (req, res) {
  try {
    const pass = req.body.OldPw;
    const id = req.session.authUser;
    const user = await accountModel.single(id);
    const ret = bcrypt.compareSync(pass, user.Password);
    if (ret === false) {
      res.render("vwTeacherPages/vwAccount/security", {
        error: "Mật khẩu hiện tại không đúng!",
        layout: "main-teacher",
        tiltle: "Đổi mật khẩu",
      });
    } else {
      const hash = bcrypt.hashSync(req.body.NewPw, 10);
      user.Password = hash;
      await accountModel.patch(user);
      res.render("vwTeacherPages/vwAccount/security", {
        success: "Mật khẩu đã được thay đổi",
        layout: "main-teacher",
        tiltle: "Đổi mật khẩu",
      });
    }
  } catch (error) {
    throw error;
  }
});
module.exports = router;
