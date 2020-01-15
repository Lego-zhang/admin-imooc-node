const express = require("express");

const Result = require("../models/Result");

const { md5, decoded } = require("../utils/index");

const { login, findUser } = require("../services/user");

const { PWD_SALT, PRIVATE_KEY, JWT_EXPIRED } = require("../utils/constant");

// 表单校验 body方法
const { body, validationResult } = require("express-validator");

const boom = require("boom");

const router = express.Router();

const jwt = require("jsonwebtoken");

router.post(
  "/login",
  [
    body("username")
      .isString()
      .withMessage("用户名必须为字符"),
    body("password")
      .isString()
      .withMessage("密码必须为字符")
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
          const token = jwt.sign({ username }, PRIVATE_KEY, {
            expiresIn: JWT_EXPIRED
          });

          new Result({ token }, "登录成功").success(res);
        }
      });
    }
  }
);

router.get("/info", function(req, res, next) {
  // 根据项目实际的Username动态的去获取用户名
  // 从header中拿到JWT进行解析 用户名
  const decode = decoded(req);

  if (decode && decode.username) {
    findUser("admin").then(user => {
      if (user) {
        user.roles = [user.role]
        new Result(user, "用户信息查询成功").success(res);
      } else {
        new Result("用户信息查询失败").fail(res);
      }
    });
  } else {
    new Result("用户信息查询失败").fail(res);
  }
});

module.exports = router;
