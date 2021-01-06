const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const accountModel = require("../../models/account.model");
const teacherModel = require("../../models/teacher.model");
const authTeacher = require("../../middlewares/auth-teacher.mdw");


router.get("/",authTeacher,function (req, res) {
    res.render("vwTeacher/vwCourses/index", {
        layout:'main-teacher',
        title:'Trang chủ'
        });
});

router.get("/courses/create", authTeacher, function (req, res) {

  req.session.chapter = [];

  res.render("vwTeacher/vwCourses/add", {
    layout: "main-teacher",
    title: "Tạo khóa học",
  }); 
});

router.post("/courses/new-chapter", authTeacher, function (req, res) {
  let chap = req.session.chapter;
  let newchap = null;
  if (chap.length === 0) {
    newchap = {
      chap_stt: 1,
      chap_lesson: 0,
    };
  } else {
    newchap = {
      chap_stt: +chap[chap.length - 1].chap_stt + 1,
      chap_lesson: 0,
    };
  }
  chap.push(newchap);
  req.session.chapter = chap;
  console.log(chap);

  res.render("vwTeacher/vwCourses/new-chapter", {
    layout:false,
    chapter_stt: newchap.chap_stt,
  });
});

router.post("/courses/new-lesson", authTeacher, function (req, res) {
  let chapStt = +req.body.stt;
  let chap = req.session.chapter;
  let newLesson = +(chap[chapStt-1].chap_lesson) + 1;
  chap[chapStt - 1].chap_lesson = newLesson;
  req.session.chapter = chap;

  res.render("vwTeacher/vwCourses/new-lesson", {
    layout: false,
    lesson_stt: newLesson,
  });
});

router.post("/courses/remove-chapter", authTeacher, function (req, res) {
  const chapSTT = +req.body.stt;
  let chaps = req.session.chapter;
  console.log("STT: "+ chapSTT);
  chaps.splice(chapSTT - 1, 1);
  for (let chap of chaps )
  { 
    if(chap.chap_stt > chapSTT )
    {
      console.log(chap.chap_stt);
      chap.chap_stt -=1;
    }
  }
  req.session.chapter = chaps;
  console.log(chaps);

  return res.json(true);
});

router.post("/courses/remove-lesson", authTeacher, function (req, res) {
  const chapStt = +req.body.stt;
  let chap = req.session.chapter;
  let rmLesson = +chap[chapStt - 1].chap_lesson - 1;
  chap[chapStt - 1].chap_lesson = rmLesson;
  req.session.chapter = chap;

  return res.json(true);
});

/* GET login page. */
router.get("/login", function (req, res) {
  if (req.headers.referer) {
    if (!req.headers.referer.toString().includes("register")) {
      req.session.retUrl = req.headers.referer;
    } else {
      req.session.retUrl = null;
    }
  }

  res.render("vwTeacher/login", { layout: false });
});

router.post("/login", async function (req, res) {
  const user = await accountModel.singleByEmail(req.body.Email);
  if (user === null || +user.Role !== 1) {
    return res.render("vwTeacher/login", {
      layout: false,
      err_message: "Tài khoản không tồn tại!",
    });
  }

  const ret = bcrypt.compareSync(req.body.Password, user.Password);
  if (ret === false) {
    return res.render("vwTeacher/login", {
      layout: false,
      err_message: "Email hoặc mật khẩu sai!",
    });
  }

  req.session.isAuth = true;
  req.session.authUser = user.AccID;
  req.session.role = user.Role;
  let url = req.session.retUrl || "/teacher";
  res.redirect(url);
});

router.post("/logout", async function (req, res) {
  req.session.isAuth = false;
  req.session.authUser = null;
  res.redirect(req.headers.referer);
});




module.exports = router;
