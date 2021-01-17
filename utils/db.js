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
  host: "us-cdbr-east-03.cleardb.com",
  port: 3306,
  user: "bfbd573b53ed23",
  password: "df580b6a470f41a",
  database: "heroku_0491c11123d0a7b",
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
