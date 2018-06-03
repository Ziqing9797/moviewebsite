/**
 * Created by Eric on 2018/6/1.
 */
const fs = require('fs')
const path = require('path')
const MovieModel = require('../models/movies')
const express = require('express')
const router = express.Router();

const checkLogin = require('../middlewares/check').checkLogin

// GET /admin
router.get('/',checkLogin, function (req, res) {
  //渲染管理员界面
  res.render('admin')
})

// GET /admin/addmovie 新增一部电影
router.get('/addmovie', checkLogin, function (req, res, next) {
  res.render('addmovie')
})
// POST /admin/addmovie 新增一部电影
//校验了上传的表单字段
//并将电影信息插入数据库
router.post('/addmovie', checkLogin, function (req, res, next) {
  const author = req.session.user._id
  const title = req.fields.title
  const rating = req.fields.rating
  const image = req.files.image.path.split(path.sep).pop()
  const bio = req.fields.bio

  //校验参数
  try {
    if (!title.length){
      throw new Error('请填写电影名称！')
    }
    if (!rating.length){
      throw new Error('请填写电影评分！')
    }
    if (!req.files.image.name){
      throw new Error('请上传图片！')
    }
    if (!bio.length){
      throw new Error('请填写电影简介！')
    }
  }catch (e){
    // 注册失败，异步删除上传的图片
    fs.unlink(req.files.path)
    req.flash('error', e.message)
    return res.redirect('back')
  }

  // 待写入数据库的电影信息
  let movie = {
    author: author,
    title: title,
    rating: rating,
    image: image,
    bio: bio
  }
  MovieModel.create(movie)
    .then(function (result) {
      // 此 movie 是插入 mongodb 后的值，包含 _id
      movie = result.ops[0]
      req.flash('success', '添加成功')
      //添加成功后跳转到该电影页
      res.redirect('/admin')
      //res.redirect(`/admin/${movie._id}`)
    })
    .catchcatch(function (e) {
      // 注册失败，异步删除上传的图片
      fs.unlink(req.files.path)
      req.flash('error', e.message)
      return res.redirect('back')
      next(e)
    })

})
module.exports = router

