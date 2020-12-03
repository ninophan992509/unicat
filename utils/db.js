const mysql = require('mysql');
const util = require('util');

const pool = mysql.createPool({
    host:'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'onlinecourses',
    connectionLimit: 50,
});

//const pool_query = util.promisify(pool.query).bind(pool);

module.exports = {
    load(sql){
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
    }
};