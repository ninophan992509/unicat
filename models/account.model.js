const db = require("../utils/db");

const TBL_ACCOUNTS = "account";
const TBL_TEACHERS = "teacher";
const TBL_STUDENTS = "student";

module.exports = {
  all() {
    return db.load(`select * from ${TBL_ACCOUNTS}`);
  },

  allWithDetail() {
    return db.load(
      `select * from  (${TBL_ACCOUNTS} acc left join ${TBL_TEACHERS} tc on acc.AccID = tc.AccID) left join ${TBL_STUDENTS} st  on acc.AccID = st.AccID`
    );
  },

  async single(id) {
    const rows = await db.load(
      `select * from ${TBL_ACCOUNTS} where AccID = ${id}`
    );
    if (rows.length === 0) return null;
    return rows[0];
  },

  async singleByFaceID(id) {
    console.log(id);
    const rows = await db.load(
      `select * from ${TBL_ACCOUNTS} where FaceID = ${id}`
    );
    if (rows.length === 0) return null;
    return rows[0];
  },

  async singleByGoogleID(id) {
    const rows = await db.load(
      `select * from ${TBL_ACCOUNTS} where GoogleID = ${id}`
    );
    if (rows.length === 0) return null;
    return rows[0];
  },

  async singleByEmail(email) {
    const rows = await db.load(
      `select * from ${TBL_ACCOUNTS} where Email = '${email}'`
    );
    if (rows.length === 0) return null;
    return rows[0];
  },

  async add(entity) {
    const ret = await db.add(entity, TBL_ACCOUNTS);
    return ret.insertId;
  },

  patch(entity) {
    const condition = { AccID: entity.AccID };
    const acc = {
      Password: entity.Password,
    };
    return db.patch(acc, condition, TBL_ACCOUNTS);
  },
};
