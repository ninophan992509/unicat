const db = require("../utils/db");

const TBL_STUDENTS = "student";

module.exports = {
  all() {
    return db.load(`select * from ${TBL_STUDENTS}`);
  },

  add(entity) {
    return db.add(entity, TBL_STUDENTS);
  },
};
