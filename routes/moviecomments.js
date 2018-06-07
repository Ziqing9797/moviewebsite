/**
 * Created by Eric on 2018/6/6.
 */
const express = require('express')
const router = express.Router()

const checkLogin = require('../middlewares/check').checkLogin
const MovieCommentModel = require('../models/moviecomments')

// POST /moviecomments 创建一条留言
router.post('/', checkLogin, function (req, res, next) {
  const author = req.session.user._id
  const movieId = req.fields.movieId
  const content = req.fields.content

  // 校验参数
  try {
    if (!content.length) {
      throw new Error('请填写评论内容')
    }
  } catch (e) {
    req.flash('error', e.message)
    return res.redirect('back')
  }

  const comment = {
    author: author,
    movieId: movieId,
    content: content
  }

  MovieCommentModel.create(comment)
    .then(function () {
      req.flash('success', '评论成功')
      // 留言成功后跳转到上一页
      res.redirect('back')
    })
    .catch(next)
})

// GET /moviecomments/:moviecommentId/remove 删除一条留言
router.get('/:moviecommentId/remove', checkLogin, function (req, res, next) {
  const moviecommentId = req.params.moviecommentId
  const author = req.session.user._id

  MovieCommentModel.getMovieCommentById(moviecommentId)
    .then(function (moviecomment) {
      if (!moviecomment) {
        throw new Error('留言不存在')
      }
      if (moviecomment.author.toString() !== author.toString()) {
        throw new Error('没有权限删除留言')
      }
      MovieCommentModel.delMovieCommentById(moviecommentId)
        .then(function () {
          req.flash('success', '删除留言成功')
          // 删除成功后跳转到上一页
          res.redirect('back')
        })
        .catch(next)
    })
})

module.exports = router
