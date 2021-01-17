const express = require("express");
const auth = require("../../middlewares/auth-admin.mdw");
const router = express.Router();
const teacherModel = require("../../models/teacher.model");

router.get("/", auth, async function (req, res) {
  const teachers = await teacherModel.all();
  res.render("vwAdminPages/vwTeachers/index", {
    layout: "main-admin",
    title: "Teachers",
    teachers,
  });
});

module.exports = router;
