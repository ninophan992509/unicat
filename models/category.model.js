const db = require('../utils/db');

const TBL_COURSES = 'course';
const TBL_FIELDS = 'field';
const TBL_CATEGORIES = 'category';

module.exports = {
  async single(id) {
    const rows = await db.load(
      `select * from ${TBL_CATEGORIES} where CatID = ${id}`
    );
    if (rows.length === 0) return null;
    return rows[0];
  },
  all() {
    return db.load(`select * from ${TBL_CATEGORIES}`);
  },
  allWithDetails() {
    return db.load(`select ct.*, count(c.CourID) as CatCourses, count(distinct f.FldID ) as SubCat
                    from ${TBL_CATEGORIES} ct left join ${TBL_FIELDS} f on ct.CatID = f.CatID
                    left join ${TBL_COURSES} c on c.FldID = f.FldID
                    group by ct.CatID 
                    order by ct.CatID asc`);
  },

  async byCourId(id) {
    const rows = await db.load(`select cat.* FROM ${TBL_CATEGORIES} cat, ${TBL_FIELDS} f, ${TBL_COURSES} c 
                    where f.CatID = cat.CatID and c.FldID = f.FldID and c.CourID = ${id}`);
    if (rows.length === 0) return null;
    return rows[0];
  },

  async add(entity) {
    const ret = await db.add(entity, TBL_CATEGORIES);
    return ret.insertId;
  },
  del(entity) {
    const condition = { CatID: entity.CatID };
    return db.del(condition, TBL_CATEGORIES);
  },
  patch(entity) {
    const condition = { CatID: entity.CatID };
    delete entity.ChapID;
    return db.patch(entity, condition, TBL_CATEGORIES);
  },
};
