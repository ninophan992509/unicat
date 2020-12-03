const db = require('../utils/db');
const TBL_COURSES = 'courses';
//course.name as CourseName, course.review as CountReview, course.price as CoursePrice, course.image as CourseImage, teacher.name as TeacherName ,teacher.avatar as TeacherAvatar
module.exports = {
    getThreeFirstCourse(category)
    {
       return  db.load(`select *
         from ((course INNER JOIN category on category.id = course.category_id) INNER JOIN teacher on course.teacher_id = teacher.id) 
         where category.name in ('${category}') limit 3`);
    },

    all()
    {
        return db.load('select * from course');
    }

}