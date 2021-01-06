const db = require("../utils/db");
const TBL_FAVOURITE_COURSES = "favouritecourse";

module.exports = {
  allByStdID(id)
  {
      return db.load(`select fc.CourID, fc.FavID from ${TBL_FAVOURITE_COURSES} fc where fc.StdID = ${id}`);
  },

  add(entity) {
    return db.add(entity, TBL_FAVOURITE_COURSES);
  },

  del(entity) {
    const condition = {FavID: entity.FavID};
    return db.del(condition, TBL_FAVOURITE_COURSES);
  },
};