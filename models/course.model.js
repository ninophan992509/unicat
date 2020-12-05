const db = require('../utils/db');
const TBL_COURSES = 'courses';
//course.name as CourseName, course.review as CountReview, course.price as CoursePrice, course.image as CourseImage, teacher.name as TeacherName ,teacher.avatar as TeacherAvatar
module.exports = {

    all()
    {
        return db.load('select * from course');
    }

}