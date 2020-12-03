const express = require('express');
const router = express.Router();
const courseModel = require('../models/course.model');

/* GET home page. */
router.get(['/','/home'], async function(req, res, next) {
  
  try { 
    const category = 'Ngoại Ngữ';
    const listCourse = await courseModel.getThreeFirstCourse(category);   
    console.log(listCourse);
    res.render('index',{ 
      title: 'Trang chủ', 
      home_page:true,
      listCourse
    });
  }
  catch(err) {
    console.error(err);
    res.send('View error log at server console.');
  }
});

/* GET course page. */
router.get('/course', function(req, res, next) {
  res.render('course', { title: 'Chi tiết khóa học', course_page:true});
});

/* GET courses page. */
router.get('/courses', function(req, res, next) {
  res.render('courses', { title: 'Các khóa học', courses_page:true});
});





module.exports = router;
