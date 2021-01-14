const db = require("../utils/db");
const TBL_STUDENT_COURSES = "studentcourse";
const TBL_STUDENTS = "student";

module.exports = {
  async single(id) {
    const row = await db.load(
      `select * from ${TBL_STUDENT_COURSES} where RatID = ${id}`
    );
    return row.length === 0 ? null : row[0];
  },

  async singleByCourIDAndStdID(CourID, StdID) {
    const row = await db.load(
      `select * from ${TBL_STUDENT_COURSES} where CourID = ${CourID} and StdID = ${StdID}`
    );
    return row.length === 0 ? null : row[0];
  },

  async singleWithDetails(RatID, CourID) {
    const row = await db.load(
      `select c.*, count(sc.StdID) as CourStudents, count(case when sc.Point != 0 then 1 end) as CourRates,avg(case when sc.Point != 0 then sc.Point end) as CourPoint
                                from ${TBL_COURSES} c 
                                left join ${TBL_STUDENT_COURSES} sc on c.CourID = sc.CourID 
                                where c.CourID =${CourID}`
    );
    return row.length === 0 ? null : row[0];
  },

  async singlePercentReview(id) {
    const row = await db.load(
     `CALL CalcPercentRating(${id}, @p1, @p2, @p3, @p4, @p5); SELECT @p1 AS p1, @p2 AS p2, @p3 AS p3, @p4 AS p4, @p5 AS p5`
    );
    return row.length === 0 ? null : row[1];
  },

  allByCourID(id) {
    return db.load(`select sc.*, st.StdName, st.StdAvatar
                      from ${TBL_STUDENT_COURSES} sc
                      left join ${TBL_STUDENTS} st on st.StdID = sc.StdID
                      where sc.CourID = ${id} and sc.Point != 0`);
  },

  add(entity) {
    return db.add(entity, TBL_STUDENT_COURSES);
  },
   
  patch(entity)
  {
     const condition = { RatID:entity.RatID};
     delete entity.RatID;
     return db.patch(entity,condition,TBL_STUDENT_COURSES);
  },
};
