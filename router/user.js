const express = require("express");

const Result = require("../models/Result");

const { querySql } = require("../db");

const router = express.Router();

router.post("/login", function(req, res) {
  // console.log(req.body);
  const { username, password } = req.body;

  // console.log(querSql())

  querySql("select * from admin_user").then(results => {
    // console.log(results);
  }).catch(err=>{
    // console.log(err)
  })



  // new Result("登录成功").success(res);
  if (username === "admin" && password === "admin") {
    new Result("登录成功").success(res);
  } else {
    new Result("登录失败").fail(res);
  }
});

router.get("/info", function(req, res, next) {
  res.json("user info...");
});

module.exports = router;
