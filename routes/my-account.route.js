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
      res.redirect('/');
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

    res.render("vwMyCourses/index", {
      title: course.CourName,
      course,
      empty: course.length === 0,
    });
  }
});

module.exports = router;
