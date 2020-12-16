const express = require('express');
const router = express.Router();
const courseModel = require('../models/course.model');
const teacherModel = require('../models/teacher.model');
const categoryModel = require('../models/category.model');
const chapterModel = require('../models/chapter.model');
const lessonModel = require('../models/lesson.model');

/* GET course page. */
router.get('/:id', async function(req, res) {
  const id = req.params.id;
  const course = await courseModel.single(id);
  course.category = await categoryModel.byCourId(course.CourID);
  course.teacher = await teacherModel.singleWithDetails(course.TeachID);
  course.chapters = await chapterModel.allChapterByCourID(course.CourID);
  course.lessons = await lessonModel.allLessonByCourID(course.CourID);
  
  res.render('vwCourse/index', {
    title: 'Chi tiết khóa học', 
    course,
    empty:course.CourID === null,
    });  
});


module.exports = router;