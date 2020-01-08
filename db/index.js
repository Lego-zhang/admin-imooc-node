const mysql = require("mysql");

const config = require("./config");

const debug = require("./../utils/constant")
// 连接
function connect() {
  // 创建链接
  return mysql.createConnection({
    host: config.host,
    user: config.user,
    password: config.password,
    database: config.database,
    // 多个陈述F
    multipleStatements: true
  });
}
// 查询在当前文件中完成，不要暴露在外部，
// 添加 querySql 
// 查询完成要进行释放连接,不进行释放连接，连接会保存在内存当中，造成内存泄漏  conn.end();


function querySql(sql) {
  const conn = connect();
  debug && console.log(sql);
  return new Promise((resolve, reject) => {
    try {
      conn.query(sql, (err, results) => {
        if (err) {
          // 增加日志输出 
          // 当debug 为true时在终端显示错误提示
          debug && console.log("查询失败，原因:" + JSON.stringify(err));
          reject(err);
        } else {
          debug && console.log("查询成功", JSON.stringify(results));
          resolve(results);
        }
      });
    } catch (e) {
      reject(e);
    } finally {
      conn.end();
    }
  });
}

module.exports = {
  querySql
};
