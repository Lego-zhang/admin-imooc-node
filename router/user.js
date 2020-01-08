const express = require("express");

const Result = require("../models/Result");

const { md5 } = require("../utils/index");

const { login } = require("../services/user");
const { PWD_SALT } = require("../utils/constant");

const router = express.Router();

router.post("/login", function(req, res) {
  // console.log(req.body);
  let { username, password } = req.body;

  password = md5(`${password}${PWD_SALT}`);

  login(username, password).then(user => {
    console.log(user + "1");
    if (!user || user.length === 0) {
      new Result("登录失败").fail(res);
    } else {
      new Result("登录成功").success(res);
    }
  });
});

router.get("/info", function(req, res, next) {
  res.json("user info...");
});

module.exports = router;
