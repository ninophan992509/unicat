const db = require("../utils/db");

const TBL_ACCOUNTS = "account";
const TBL_TEACHERS = "teacher";
const TBL_STUDENTS = "student";

module.exports = {


   all()
   {
       return db.load(`select * from ${TBL_ACCOUNTS}`);
   },

   allWithDetail() {
       return db.load(
         `select * from  (${TBL_ACCOUNTS} acc left join ${TBL_TEACHERS} tc on acc.AccID = tc.AccID) left join ${TBL_STUDENTS} st  on acc.AccID = st.AccID`
       );
   },

   async singleByEmail(email)
   {
       const rows = db.load(`select * from ${TBL_ACCOUNTS} where Email = ${email}`);
       if(rows.length === 0)
        return null;
       return rows[0];
   }
   
   add(entity) {
       return db.add(entity,TBL_ACCOUNTS);
   }

};
