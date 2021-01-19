const express = require("express");
const auth = require("../../middlewares/auth-admin.mdw");
const router = express.Router();
const studentModel = require("../../models/student.model");

router.get("/", auth, async function (req, res) {
  const students = await studentModel.all();
  res.render("vwAdminPages/vwStudents/index", {
    layout: "main-admin",
    title: "Students",
    students,
    mg_st:1,
  });
});

module.exports = router;
