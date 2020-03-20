const express = require("express");
const router = require("./router");

const fs = require("fs");
const https = require("https");

// 解析 boby
const bodyParser = require("body-parser");

// 解决跨域问题
const cors = require("cors")

// 创建 express 应用
const app = express();


// 使用cors() 跨域扩展

app.use(cors())

// 解析路由参数
app.use(bodyParser.urlencoded({ extended: true }));
// 解析json 形式的body
app.use(bodyParser.json());

app.use("/", router);
// 监听 / 路径的 get 请求


const privateKey = fs.readFileSync("./https/summerxiatian.top.key", "utf8");
const certificate = fs.readFileSync("./https/summerxiatian.top.pem", "utf8");

const credentials = { key: privateKey, cert: certificate };
const httpsServer = https.createServer(credentials, app);

const SSLPORT = 18082;

// 使 express 监听 5000 端口号发起的 http 请求
// const server = app.listen(5000, function() {
//   const { address, port } = server.address();
//   console.log("Http Server is running on http://%s:%s", address, port);
// });

httpsServer.listen(18082, function() {
  console.log("HTTPS Server is running on: https://localhost:%s", 18082);
});
