

// 上传文件保存地址
const {env} = require('./env')

const UPLOAD_PATH =
  env === "dev"
    ? "/Users/longtian/Documents/code/server/upload/admin-upload-ebook"
    : "/root/upload/admin-upload/ebook";

module.exports = {
  CODE_SUCCESS: 0,
  CODE_ERROR: -1,
  CODE_TOKEN_EXPIRED: -2,
  debug: true,
  PWD_SALT: "admin_imooc_node",
  PRIVATE_KEY: "admin_imooc_node_xiatian",
  JWT_EXPIRED: 60 * 60, // token失效时间
  UPLOAD_PATH
};
// PWD_SALT 盐值可以当做pwd中的秘钥
