const express = require('express');
const router = express.Router();
const courseModel = require('../models/course.model');

/* GET courses page. */
router.get('/', function(req, res) {
  res.render('vwCourses/index', { title: 'Các khóa học',courses_page:true});
});

module.exports = router;