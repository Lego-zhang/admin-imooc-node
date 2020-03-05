const mysql = require("mysql");

const config = require("./config");

const debug = require("./../utils/constant");

const { isObject } = require("./../utils/index");
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

// 单独查询某一个用户
function queryOne(sql) {
  return new Promise((resolve, reject) => {
    querySql(sql)
      .then(results => {
        if (results && results.length > 0) {
          resolve(results[0]);
        } else {
          resolve(null);
        }
      })
      .catch(err => {
        reject(err);
      });
  });
}

function insert(model, tableName) {
  return new Promise((resolve, reject) => {
    if (!isObject(model)) {
      reject(new Error("插入数据库失败，插入数据非对象"));
    } else {
      const keys = [];
      const values = [];
      Object.keys(model).forEach(key => {
        if (model.hasOwnProperty(key)) {
          keys.push(`\`${key}\``);
          values.push(`'${model[key]}'`);
        }
      });
      if (keys.length > 0 && values.length > 0) {
        let sql = `INSERT INTO \`${tableName}\` (`;
        const keyString = keys.join(",");
        const valuesString = values.join(",");
        sql = `${sql}${keyString}) VALUES (${valuesString})`;
        debug && console.log(sql);

        const conn = connect();
        try {
          conn.query(sql, (err, result) => {
            if (err) {
              reject(err);
            } else {
              resolve(result);
            }
          });
        } catch (e) {
          reject(e);
        } finally {
          conn.end();
        }
      } else {
        reject(new Error("插入数据库失败，对象中没有任何属性"));
      }
    }
  });
}

function update(model, tableName, where) {
  return new Promise((resolve, reject) => {
    if (!isObject(model)) {
      reject(new Error("插入数据库失败，插入数据非对象"));
    } else {
      const entry = [];
      Object.keys(model).forEach(key => {
        if (model.hasOwnProperty(key)) {
          entry.push(`\`${key}\`='${model[key]}'`);
        }
      });
      if (entry.length > 0) {
        let sql = `UPDATE \`${tableName}\` SET`;
        sql = `${sql}${entry.join(",")} ${where}`;
        debug && console.log(sql);
        const conn = connect();
        try {
          conn.query(sql, (err, result) => {
            if (err) {
              reject(err);
            } else {
              resolve(result);
            }
          });
        } catch (e) {
          reject(e);
        } finally {
          conn.end();
        }
      }
    }
  });
}

module.exports = {
  querySql,
  queryOne,
  insert,
  update
};
