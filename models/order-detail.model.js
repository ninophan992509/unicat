const TBL_ORDER_DETAIL = "orderdetail";
const db = require("../utils/db");
module.exports = {
  async add(entity) {
    return db.add(entity, TBL_ORDER_DETAIL);
  },
};
