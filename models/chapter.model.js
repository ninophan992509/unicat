const db = require("../utils/db");

const TBL_CHAPTERS = "chapter";

module.exports = {
  async single(id) {
    const rows = await db.load(`select * from ${TBL_CHAPTERS} where ChapID = ${id}`);
    if (rows.length === 0) return null;
    return rows[0];
  },

  allChapterByCourID(id) {
    return db.load(
      `select ch.* from ${TBL_CHAPTERS} as ch where ch.CourID = ${id} order by ch.ChapSTT asc`
    );
  },
  async add(entity) {
    const ret = await db.add(entity, TBL_CHAPTERS);
    return ret.insertId;
  },
  patch(entity) {
    const condition = { ChapID: entity.ChapID };
    delete entity.ChapID;
    return db.patch(entity, condition, TBL_CHAPTERS);
  },
  del(entity) {
    const condition = { ChapID: entity.ChapID };
    return db.del(condition, TBL_CHAPTERS);
  },
};
