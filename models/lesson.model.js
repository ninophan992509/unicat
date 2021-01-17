const db = require("../utils/db");

const TBL_LESSONS = "lesson";
const TBL_CHAPTERS = "chapter";
const TBL_COURSES = "course";

module.exports = {
  async singleLink(id) {
    const rows = await db.load(`select ls.LessID, ls.LessLink, c.CourID, ch.ChapID from ${TBL_LESSONS} ls 
                          inner join ${TBL_CHAPTERS} ch on ch.ChapID = ls.ChapID  
                          inner join ${TBL_COURSES} c on c.CourID = ls.CourID 
                          where ls.LessID = ${id}`);
    if (rows.length === 0) return null;
    return rows[0];
  },
  allLessonByChapID(id) {
    return db.load(`select ls.* from
                    ${TBL_LESSONS} ls 
                    where ls.ChapID = ${id}`);
  },

  allLessonByCourID(id) {
    return db.load(
      `select l.* from ${TBL_LESSONS} as l where l.CourID = ${id} order by l.LessSTT`
    );
  },
  async add(entity) {
    const ret = await db.add(entity, TBL_LESSONS);
    return ret.insertId;
  },
  patch(entity) {
    const condition = { LessID: entity.LessID };
    delete entity.LessID;
    return db.patch(entity, condition, TBL_LESSONS);
  },
  del(entity) {
    const condition = { LessID: entity.LessID };
    return db.del(condition, TBL_LESSONS);
  },
};
