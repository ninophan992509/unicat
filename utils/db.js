const mysql = require("mysql2");
const util = require("util");
/*
const pool = mysql.createPool({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "",
  database: "onlinecourses",
  connectionLimit: 50,
  multipleStatements: true,
});*/

const pool = mysql.createPool({
  host: "eu-cdbr-west-03.cleardb.net",
  // port: 3306,
  user: "beb3a28e7ccc78",
  password: "0b68df43",
  database: "heroku_4e6b004e8c05e5f",
  connectionLimit: 50,
  multipleStatements: true,
});

const pool_query = util.promisify(pool.query).bind(pool);

module.exports = {
  load: (sql) => pool_query(sql),
  add: (entity, tableName) =>
    pool_query(`insert into ${tableName} set ?`, entity),
  del: (condition, tableName) =>
    pool_query(`delete from ${tableName} where ?`, condition),
  patch: (entity, condition, tableName) =>
    pool_query(`update ${tableName} set ? where ?`, [entity, condition]),

  /* load(sql){
        return new Promise(
            function (done,fail) {
                pool.query(sql, function(error, results, fields)
                {
                    if (error)
                        fail(error);
                    else {
                        done(results);
                    }
                })
            }
        )
    }*/
};
