const express = require("express");
const auth = require("../../middlewares/auth-admin.mdw");
const router = express.Router();
const teacherModel = require("../../models/teacher.model");
const accountModel = require("../../models/account.model");
const bcrypt = require("bcryptjs");

router.get("/", auth, async function (req, res) {
  const teachers = await teacherModel.all();
  res.render("vwAdminPages/vwTeachers/index", {
    layout: "main-admin",
    title: "Teachers",
    teachers,
    mg_tc: 1,
  });
});



router.get("/new-teacher", auth, function (req, res) {
  res.render("vwAdminPages/vwTeachers/new", {
    layout: "main-admin",
    title: "Thêm tài khoản giảng viên",
    mg_tc: 1,
  });
});

router.get("/is-available", async function (req, res) {
  const email = req.query.email;
  const user = await accountModel.singleByEmail(email);
  if (user === null) {
    return res.json(true);
  }
  res.json(false);
});

router.post("/new-teacher", auth, async function (req, res) {
  try {
    const hash = bcrypt.hashSync(req.body.password, 10);
    const new_account = {
      Email: req.body.email,
      Password: hash,
      Role: 1,
    };

    const AccID = await accountModel.add(new_account);
    const new_teacher = {
      AccID,
      TeachName: req.body.username,
    };
    await teacherModel.add(new_teacher);
    res.redirect("/admin/manage-teachers");
  } catch (error) {
    throw error;
  }
});

module.exports = router;
