const express = require("express");

const Result = require("../models/Result");

const { md5 } = require("../utils/index");

const { login } = require("../services/user");

const { PWD_SALT } = require("../utils/constant");

// 表单校验 body方法
const { body, validationResult } = require("express-validator");

const boom = require("boom");

const router = express.Router();

router.post(
  "/login",
  [
    body("username")
      .isString()
      .withMessage("用户名必须为字符"),
    body("password")
      .isNumeric()
      .withMessage("密码必须为数字")
  ],
  function(req, res, next) {
    // 使用验证 validationResult()
    const err = validationResult(req);
    console.log(err);

    if (!err.isEmpty()) {
      // const msg  = err.errors[0].msg
      const [{ msg }] = err.errors;
      next(boom.badRequest(msg));
    } else {
      let { username, password } = req.body;

      password = md5(`${password}${PWD_SALT}`);

      login(username, password).then(user => {
        if (!user || user.length === 0) {
          new Result("登录失败").fail(res);
        } else {
          new Result("登录成功").success(res);
        }
      });
    }
  }
);

router.get("/info", function(req, res, next) {
  res.json("user info...");
});

module.exports = router;
