const db = require("../utils/db");

const TBL_LESSONS = "lesson";

module.exports = {
  allLessonByCourID(id) {
    return db.load(
      `select l.* from ${TBL_LESSONS} as l where l.CourID = ${id} order by l.LessSTT`
    );
  },
  async add(entity) {
    const ret = await db.add(entity, TBL_LESSONS);
    return ret.insertId;
  },
};
