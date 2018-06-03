/**
 * Created by Eric on 2018/4/1.
 */
const sha1 = require('sha1')
const express = require('express')
const router = express.Router()

const UserModel = require('../models/users')
const checkNotLogin = require('../middlewares/check').checkNotLogin

// GET /adminsignin 管理员登录页
router.get('/', checkNotLogin, function (req, res, next) {
  res.render('adminsignin')
})

// POST /adminsignin 管理员登录
router.post('/', checkNotLogin, function (req, res, next) {
  const name = req.fields.name
  const password = req.fields.password

  // 校验参数
  try {
    if (!name.length) {
      throw new Error('请填写用户名')
    }
    if (!password.length) {
      throw new Error('请填写密码')
    }
  } catch (e) {
    req.flash('error', e.message)
    return res.redirect('back')
  }

  UserModel.getUserByName(name)
    .then(function (user) {
      //检查是否为管理员用户
      if (user.name!=='admin') {
        req.flash('error', '管理员用户不存在')
        return res.redirect('back')
      }
      // 检查密码是否匹配
      if (sha1(password) !== user.password) {
        req.flash('error', '用户名或密码错误')
        return res.redirect('back')
      }
      req.flash('success', '欢迎进入管理员界面！')
      // 用户信息写入 session
      delete user.password
      req.session.user = user
      // 跳转到管理员界面
      res.redirect('/admin')
    })
    .catch(next)
})

module.exports = router
