const express = require("express");
const auth = require("../../middlewares/auth-admin.mdw");
const router = express.Router();
const categoryModel = require("../../models/category.model");
const courseModel = require("../../models/course.model");
const teacherModel = require("../../models/teacher.model");

router.get("/", auth, async function (req, res) {
  const courses = await courseModel.allWithDetails();
  const teachers = await teacherModel.all();
  res.render("vwAdminPages/vwCourses/index", {
    layout: "main-admin",
    title: "Courses",
    courses,
    teachers,
    mg_cs: 1,
  });
});

router.post("/get-courses", auth, async function (req, res) {
  try {
    const TeachID = +req.body.id;
    const teachers = await teacherModel.all();
    const teacher = teachers.find((teacher) => teacher.TeachID === TeachID);
    const courses = await courseModel.allByTeachID(TeachID);
    res.render("vwAdminPages/vwCourses/index", {
      layout: "main-admin",
      title: "Courses",
      courses,
      teachers,
      teacher,
      mg_cs: 1,
    });
  } catch (error) {
    throw error;
  }
});

router.post("/disable-course", auth, async function (req, res) {
  try {
    const entity = {
      CourID: +req.body.course,
      isDisable: +req.body.status === 0 ? 1 : 0,
    };
    await courseModel.patch(entity);
    res.redirect("/admin/manage-courses");
  } catch (error) {
    throw error;
  }
});

module.exports = router;
