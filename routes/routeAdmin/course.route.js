const express = require("express");
const auth = require("../../middlewares/auth-admin.mdw");
const router = express.Router();
const categoryModel = require("../../models/category.model");
const courseModel = require("../../models/course.model");

router.get("/", auth, async function (req, res) {
  const categories = await categoryModel.allWithDetails();
  const courses = await courseModel.allWithDetails();
  res.render("vwAdminPages/vwCourses/index", {
    layout: "main-admin",
    title: "Courses",
    categories,
    courses  
  });
});

module.exports = router;

