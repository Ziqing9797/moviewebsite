/**
 * Created by Eric on 2018/6/4.
 */
const marked = require('marked')
const MovieComment = require('../lib/mongo').MovieComment

//将 moviecomment 的 content 从 markdown 转换成 html
MovieComment.plugin('contentToHtml', {
  afterFind: function (moviecomments) {
    return moviecomments.map(function (moviecomment) {
      moviecomment.content = marked(moviecomment.content)
      return moviecomment
    })
  }
})

module.exports = {
  // 创建一个留言
  create: function create (moviecomment) {
    return MovieComment.create(moviecomment).exec()
  },

  // 通过留言 id 获取一个留言
  getMovieCommentById: function getMovieCommentById (moviecommentId) {
    return MovieComment.findOne({_id: moviecommentId}).exec()
  },

  // 通过留言 id 删除一个留言
  delMovieCommentById: function delMovieCommentById (moviecommentId) {
    return MovieComment.deleteOne({_id: moviecommentId}).exec()
  },

  // 通过文章 id 删除该文章下所有留言
  delMovieCommentsByMovieId: function delMovieCommentsByPostId (movieId) {
    return MovieComment.deleteMany({movieId: movieId}).exec()
  },

  // 通过文章 id 获取该文章下所有留言，按留言创建时间升序
  getMovieComments: function getMovieComments (movieId) {
    return MovieComment
      .find({movieId: movieId})
      .populate({path: 'author', model: 'User'})
      .sort({_id: 1})
      .addCreatedAt()
      .contentToHtml()
      .exec()
  },

  // 通过文章 id 获取该文章下留言数
  getMovieCommentsCount: function getMovieCommentsCount (movieId) {
    return MovieComment.count({movieId: movieId}).exec()
  }
}
