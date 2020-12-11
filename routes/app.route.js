const express = require('express');
const router = express.Router();
const courseModel = require('../models/course.model');


/* GET home page. */
router.get('/', async function(req, res) {
  
  try { 
    const new_rows  =  await courseModel.top10NewestCourses();
    const view_rows =  await courseModel.top10ViewestCourses();
    const list_cats =  await courseModel.bestSellingCatsThisWeek();
    const pop_rows  =  await courseModel.top3PopularCoursesThisWeek();
    res.render('index',{ 
      title: 'Trang chủ', 
      home_page:true,
      newestCourses: new_rows,
      viewestCourses: view_rows,
      topCats:list_cats,
      popularCourses:pop_rows,

    });
  }
  catch(err) {
    console.error(err);
    res.send('View error log at server console.');
  }
});

/* GET login page. */
router.get('/login', function(req, res) {
  res.render('login', { layout:false});
});

/* GET register page. */
router.get('/register', function(req, res) {
  res.render('register', { layout:false});
});




module.exports = router;
