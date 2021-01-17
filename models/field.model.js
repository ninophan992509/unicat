const db = require("../utils/db");

const TBL_FIELDS = "field";
const TBL_CATEGORIES = "category";
const TBL_COURSES = "course";
module.exports = {
  allWithDetails() {
    return db.load(`select ct.CatName, f.*, count(c.CourID) as FldCourses
                     from ${TBL_CATEGORIES} ct inner join ${TBL_FIELDS} f on ct.CatID = f.CatID
                     left join ${TBL_COURSES} c on c.FldID = f.FldID
                     group by F.FldID
                     order by F.FldID asc`);
  },
  all() {
    return db.load(`select * from ${TBL_FIELDS}`);
  },

  allFieldOfCategory(entity) {
    return db.load(
      `select f.* from ${TBL_FIELDS} as f where f.CatID = ${entity.CatID}`
    );
  },

  async add(entity)
  {
     const ret = await db.add(entity, TBL_FIELDS);
     return ret.insertId;
  }
};
