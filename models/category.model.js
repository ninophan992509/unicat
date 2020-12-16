const db = require('../utils/db');

const TBL_COURSES = 'course';
const TBL_FIELDS = 'field';
const TBL_CATEGORIES = 'category';

module.exports = {
  all() {
    return db.load(`select * from ${TBL_CATEGORIES}`);
  },

  async byCourId(id) {
    const rows = await db.load(`select cat.* FROM ${TBL_CATEGORIES} cat, ${TBL_FIELDS} f, ${TBL_COURSES} c 
                    where f.CatID = cat.CatID and c.FldID = f.FldID and c.CourID = ${id}`);
    if (rows.length === 0) return null;
    return rows[0];
  },
};
