const db = require('../utils/db');

const TBL_CHAPTERS = 'chapter';

module.exports = {

  allChapterByCourID(id) {
    return db.load(
      `select ch.* from ${TBL_CHAPTERS} as ch where ch.CourID = ${id} order by ch.ChapSTT asc`
    );
  },
};
