// 解析jwt 路由验证
const expressJwt = require("express-jwt");
// 要传入的秘钥
const { PRIVATE_KEY } = require("../utils/constant");

// 解析jwt 需要提供一个秘钥

const jwtAuth = expressJwt({
  secret: PRIVATE_KEY,
  credentialsRequired: true
  // 设置为false就不进行校验了，游客也可以访问
}).unless({
  // 设置 jwt认证 路由 白名单
  path: ["/", "/user/login"]
});

module.exports = jwtAuth;