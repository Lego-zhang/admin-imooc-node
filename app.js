const express = require("express");

// 创建 express 应用
const app = express();

const router = require("./router");

app.use("/", router);
// 监听 / 路径的 get 请求

// 使 express 监听 5000 端口号发起的 http 请求
const server = app.listen(5000, function() {
  const { address, port } = server.address();
  console.log("Http Server is running on http://%s:%s", address, port);
});
