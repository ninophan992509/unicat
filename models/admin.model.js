const db = require("../utils/db");
const TBL_ACCOUNTS = "account";
const TBL_ADMINS = "admin";
module.exports = {
  
  async single(id) {
    const rows = await db.load(
      `select ac.*, ad.* from ${TBL_ACCOUNTS} ac inner join ${TBL_ADMINS} ad on ac.AccID = ad.AccID 
       where ac.AccID = ${id}`
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
