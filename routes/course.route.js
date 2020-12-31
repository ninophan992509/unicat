const express = require("express");
const config = require("../config/default.json");
const router = express.Router();
const courseModel = require("../models/course.model");
const teacherModel = require("../models/teacher.model");
const categoryModel = require("../models/category.model");
const chapterModel = require("../models/chapter.model");
const lessonModel = require("../models/lesson.model");

/* GET course page. */
router.get("/detail/:id", async function (req, res) {
  const id = req.params.id;
  const course = await courseModel.single(id);
  course.category = await categoryModel.byCourId(course.CourID);
  course.teacher = await teacherModel.singleWithDetails(course.TeachID);
  course.chapters = await chapterModel.allChapterByCourID(course.CourID);
  course.lessons = await lessonModel.allLessonByCourID(course.CourID);

  res.render("vwCourses/detail", {
    title: "Chi tiết khóa học",
    course,
    empty: course.CourID === null,
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
