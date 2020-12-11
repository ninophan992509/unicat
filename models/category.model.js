const db = require('../utils/db');

const TBL_CATEGORIES = 'category';


module.exports = {
    all() {
       return db.load(`select * from ${TBL_CATEGORIES}`);
    },
   


};