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
  const author = req.query.author
  MovieModel.getMovies(author)
    .then(function (movies) {
      res.render('admin', {
        movies: movies
      })
    })
})

// GET /admin/addmovie 新增电影操作的页面
router.get('/addmovie', checkLogin, function (req, res, next) {
  res.render('addmovie')
})

// GET /admin/:movieId 获取单独电影详情页
router.get('/:movieId', function (req, res, next) {
  const movieId = req.params.movieId

  Promise.all([
    MovieModel.getMovieById(movieId), //获取电影详细信息
  ])
    .then(function (result) {
      const movie = result[0]
      if(!movie) {
        throw new Error('该电影不存在')
      }
      res.render('movie', {
        movie: movie
      })
    })
    .catch(next)

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
    // 添加失败，异步删除上传的图片
    fs.unlink(req.files.image.path)
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
      //res.redirect('/admin')
      res.redirect(`/admin/${movie._id}`)
    })
    .catch(function (e) {
      // 添加失败，异步删除上传的图片
      fs.unlink(req.files.image.path)
      req.flash('error', e.message)
      return res.redirect('back')
      next(e)
    })

})

// GET /admin/:movieId/edit 更新电影页
router.get('/:movieId/edit', checkLogin, function (req, res, next) {
  const movieId = req.params.movieId
  const author = req.session.user._id

  MovieModel.getRawMovieById(movieId)
    .then(function (movie) {
      if (!movie) {
        throw new Error('该文章不存在')
      }
      if (author.toString() !== movie.author._id.toString()) {
        throw new Error('权限不足')
      }
      res.render('movieEdit', {
        movie: movie
      })
    })
    .catch(next)
})

// POST /admin/:movieId/edit 更新一篇电影
router.post('/:movieId/edit', checkLogin, function (req, res, next) {
  const movieId = req.params.movieId
  const author = req.session.user._id
  const title = req.fields.title
  const rating = req.fields.rating
  //const image = req.files.image.path.split(path.sep).pop()
  const bio = req.fields.bio

  //校验参数
  try {
    if (!title.length){
      throw new Error('请填写电影名称！')
    }
    if (!rating.length){
      throw new Error('请填写电影评分！')
    }
    if (!bio.length){
      throw new Error('请填写电影简介！')
    }
  }catch (e){
    // 添加失败
    req.flash('error', e.message)
    return res.redirect('back')
  }

  MovieModel.getRawMovieById(movieId)
    .then(function (movie) {
      if (!movie) {
        throw new Error('文章不存在')
      }
      if (movie.author._id.toString() !== author.toString()) {
        throw new Error('没有权限')
      }
      MovieModel.updateMovieById(movieId, { title: title, rating: rating, bio: bio })
        .then(function () {
          req.flash('success', '修改文章成功')
          // 编辑成功后跳转到上一页
          res.redirect(`/admin/${movieId}`)
        })
        .catch(function (e) {
          // 添加失败
          req.flash('error', e.message)
          return res.redirect('back')
          next(e)
        })
    })
})

// GET /admin/:movieId/remove 删除一篇电影
router.get('/:movieId/remove', checkLogin, function (req, res, next) {
  const movieId = req.params.movieId
  const author = req.session.user._id

  MovieModel.getRawMovieById(movieId)
    .then(function (movie) {
      if (!movie) {
        throw new Error('文章不存在')
      }
      if (movie.author._id.toString() !== author.toString()) {
        throw new Error('没有权限')
      }
      MovieModel.delMovieById(movieId)
        .then(function () {
          req.flash('success', '删除文章成功')
          // 删除成功后跳转到主页
          res.redirect('/admin')
        })
        .catch(next)
    })
})

module.exports = router

