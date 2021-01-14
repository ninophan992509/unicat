const express = require("express");
const router = express.Router();
const courseModel = require("../models/course.model");
const studentCourseModel = require("../models/student-course.model");
const teacherModel = require("../models/teacher.model");
const categoryModel = require("../models/category.model");
const chapterModel = require("../models/chapter.model");
const lessonModel = require("../models/lesson.model");

router.get("/:id", async function (req, res) {
  const id = +req.params.id;
  const stdcourse = await studentCourseModel.single(id);
  if (stdcourse === null) {
    res.redirect("/");
  } else {
    const Id = stdcourse.CourID;
    const course = await courseModel.singleWithDetails(Id);
    course.chapters = await chapterModel.allChapterByCourID(Id);
    course.lessons = await lessonModel.allLessonByCourID(Id);
    course.comments = await studentCourseModel.allByCourID(Id);
    const rows = await studentCourseModel.singlePercentReview(Id);
    course.reviews = rows[0];
    if (course != null) {
      course.teacher = await teacherModel.singleWithDetails(course.TeachID);
    }
    
    const tab = +req.query.tab || 2;
    res.render("vwMyCourses/index", {
      title: course.CourName,
      course,
      empty: course === null,
      tab,
      ratID: +req.params.id,
    });
  }
});

router.post("/rating", async function (req, res) {
  const point = parseFloat(+req.body.point);
  const entity = {
    RatID: +req.body.id,
    Point: point,
    Feedback: req.body.comment,
  };
  await studentCourseModel.patch(entity);
  res.redirect(`/mycourses/${req.body.id}?tab=4`);
});

module.exports = router;
