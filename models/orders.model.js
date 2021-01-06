const TBL_ORDERS = "orders";
const db = require("../utils/db");

module.exports = {
  async add(entity) {
    const ret = await db.add(entity, TBL_ORDERS);
    return ret.insertId;
  },
};
