const db = require('../utils/db');

module.exports = {
    get(condition){
       return db.load(`select * from teacher where ${condition}`);
    } 
}