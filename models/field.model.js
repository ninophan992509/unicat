const db = require('../utils/db');

const TBL_FIELDS = 'field';


module.exports = {
    all() {
       return db.load(`select * from ${TBL_FIELDS}`);
    },

    allFieldOfCategory(entity)
    {
       return db.load(`select f.* from ${TBL_FIELDS} as f where f.CatID = ${entity.CatID}`);
    }

};