const express = require("express");
const router = express.Router();
const config = require("../config/default.json");
const courseModel = require("../models/course.model");
const studentCourseModel = require("../models/student-course.model");
const teacherModel = require("../models/teacher.model");
const categoryModel = require("../models/category.model");
const chapterModel = require("../models/chapter.model");
const lessonModel = require("../models/lesson.model");

/* GET course page. */
router.get("/detail/:id", async function (req, res) {
  const id = +req.params.id;
  const course = await courseModel.singleWithDetails(id);
  course.teacher = await teacherModel.singleWithDetails(course.TeachID);
  course.chapters = await chapterModel.allChapterByCourID(id);
  course.lessons = await lessonModel.allLessonByCourID(id);
  course.comments = await studentCourseModel.allByCourID(id);
  const rows = await studentCourseModel.singlePercentReview(id);
  course.reviews = rows[0];
  res.render("vwCourses/detail", {
    title: "Chi tiết khóa học",
    course,
    empty: course === null,
  });
});

router.get("/search", async function (req, res) {
  const text = req.query.text;
  const page = +req.query.page || 1;
  const limit = config.pagination.limit;
  const offset = (page - 1) * limit;
  const rows = await courseModel.pageSearch(text, offset);
  const numRows = rows.length !== 0 ? rows[0]["COUNT(*) OVER()"] : 0;
  const totalPage =
    +numRows % limit === 0
      ? Math.floor(+numRows / limit)
      : Math.floor(+numRows / limit) + 1;

  res.render("vwCourses/index", {
    title: "Các khóa học",
    courses_page: true,
    courses: rows,
    currentPage: page,
    limit,
    totalPage,
    empty: rows.length === 0,
    text,
  });
});

router.get("/byCat/:id", async function (req, res) {
  const id = +req.params.id;
  const page = +req.query.page || 1;
  const limit = config.pagination.limit;
  const offset = (page - 1) * limit;
  const rows = await courseModel.pageByCatID(id, offset);
  const numRows = rows.length !== 0 ? rows[0]["COUNT(*) OVER()"] : 0;

  const lcCategories = res.locals.lcCategories;
  let catSearch = null;
  for (let i = 0; i < lcCategories.length; i++) {
    if (+lcCategories[i].CatID === +id) {
      catSearch = lcCategories[i];
      break;
    }
  }
  const totalPage =
    +numRows % limit === 0
      ? Math.floor(+numRows / limit)
      : Math.floor(+numRows / limit) + 1;

  res.render("vwCourses/index", {
    title: "Các khóa học",
    courses_page: true,
    courses: rows,
    currentPage: page,
    limit,
    totalPage,
    catSearch,
    empty: rows.length === 0,
  });
});

router.get("/byFld/:id", async function (req, res) {
  const id = +req.params.id;
  const catId = +req.query.cat;
  const page = +req.query.page || 1;
  const limit = config.pagination.limit;
  const offset = (page - 1) * limit;
  const rows = await courseModel.pageByFldID(id, offset);
  const numRows = rows.length !== 0 ? rows[0]["COUNT(*) OVER()"] : 0;

  const lcCategories = res.locals.lcCategories;
  let catSearch = null;
  for (let i = 0; i < lcCategories.length; i++) {
    if (+lcCategories[i].CatID === +catId) {
      catSearch = lcCategories[i];
      break;
    }
  }

  const fldSearch = id;
  const totalPage =
    +numRows % limit === 0
      ? Math.floor(+numRows / limit)
      : Math.floor(+numRows / limit) + 1;

  res.render("vwCourses/index", {
    title: "Các khóa học",
    courses_page: true,
    courses: rows,
    currentPage: page,
    limit,
    totalPage,
    catSearch,
    fldSearch,
    empty: rows.length === 0,
  });
});

/* GET courses page. */
router.get("/", async function (req, res) {
  const page = +req.query.page || 1;
  const limit = config.pagination.limit;
  const offset = (page - 1) * limit;
  const rows = await courseModel.pageAll(offset);
  const numRows = rows ? rows[0]["COUNT(*) OVER()"] : 0;
  const totalPage =
    +numRows % limit === 0
      ? Math.floor(+numRows / limit)
      : Math.floor(+numRows / limit) + 1;

  res.render("vwCourses/index", {
    title: "Các khóa học",
    courses_page: true,
    courses: rows,
    currentPage: page,
    limit,
    totalPage,
    empty: rows.length === 0,
  });
});

module.exports = router;
