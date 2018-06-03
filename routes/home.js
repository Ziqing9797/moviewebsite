/**
 * Created by Eric on 2018/5/30.
 */
const MovieModel = require('../models/movies')
const express = require('express')
const router = express.Router();

// GET /home 网站首页
router.get('/', function (req, res, next) {
  //向豆瓣电影api发起请求
  //渲染管理员界面
  const author = req.query.author
  MovieModel.getMovies(author)
    .then(function (movies) {
      res.render('home', {
        movies: movies
      })
    })
})


module.exports = router;
