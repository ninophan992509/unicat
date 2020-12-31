const db = require('../utils/db');

const TBL_COURSES = 'course';
const TBL_FIELDS = 'field';
const TBL_STUDENT_COURSES = 'studentcourse';
const TBL_TEACHERS = 'teacher';
const TBL_CATEGORIES = 'category';

module.exports = {
  async single(id) {
    const rows = await db.load(
      `select * from ${TBL_TEACHERS} where TeachID = ${id}`
    );
    if (rows.length === 0) {
      return null;
    }
    return rows[0];
  },

  async singleByAccID(id) {
    const rows = await db.load(
      `select * from ${TBL_TEACHERS} where AccID = ${id}`
    );
    if (rows.length === 0) {
      return null;
    }
    return rows[0];
  },

  async singleWithDetails(id) {
    const rows = await db.load(
      `select t.*, count(re1.CourID) as TeachCourses, sum(Students) as TeachStudents, sum(CourRates) as TeachRates, avg(CourPoint) as TeachPoints
            from(
                select c.CourID , CourStudent as Students, CourRates, CourPoint
                from ${TBL_COURSES} c left outer join(
                    select sc.CourID, count(sc.CourID) as CourStudent, count(case when sc.Point != 0 then 1 end) as CourRates, avg(case when sc.Point!=0 then sc.Point end) as CourPoint
                    from ${TBL_STUDENT_COURSES} sc
                    group by sc.CourID) as re on re.CourID = c.CourID
                where c.TeachID = ${id} 
                group by c.CourID)as re1, ${TBL_TEACHERS} t
            where t.TeachID = ${id}`
    );

    if (rows.length === 0) return null;
    return rows[0];
  },

  add(entity) {
    return db.add(entity, TBL_TEACHERS);
  },
};