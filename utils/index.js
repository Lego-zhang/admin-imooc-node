const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { PRIVATE_KEY } = require("./constant");

function md5(s) {
  // 注意参数需要为 String 类型，否则会出错
  return crypto
    .createHash("md5")
    .update(String(s))
    .digest("hex");
}
// 从header中拿到JWT进行解析 提取要使用的信息
function decoded(req) {
  let token = req.get("Authorization");

  if (token.indexOf("Bearer") === 0) {
    token = token.replace("Bearer ", "");
  }

  return jwt.verify(token, PRIVATE_KEY);
}
function isObject(o) {
  return Object.prototype.toString.call(o) === "[object Object]";
}

module.exports = {
  md5,
  decoded,
  isObject
};
