const express = require('express');
const router = express.Router();
const courseModel = require('../models/course.model');

/* GET course page. */
router.get('/:id', async function(req, res) {
  const id = req.params.id;
  const course = await courseModel.single(id);
  res.render('vwCourse/index', {
    title: 'Chi tiết khóa học', 
    course_page:true,
    course,
    });  
});


module.exports = router;