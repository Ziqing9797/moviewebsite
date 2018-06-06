/**
 * Created by Eric on 2018/6/2.
 */
//电影信息
const marked = require('marked') //导入marked解析markdown文章
const Movie = require('../lib/mongo').Movie
const MovieCommentModel = require('./moviecomments')

//给 movie 添加留言数 moviecommentsCount
Movie.plugin('addMovieCommentsCount', {
  afterFind: function (movies) {
    return Promise.all(movies.map(function (movie) {
      return MovieCommentModel.getMovieCommentsCount(movie._id).then(function (moviecommentsCount) {
        movie.moviecommentsCount = moviecommentsCount
        return movie
      })
    }))
  },
  afterFindOne: function (movie) {
    if (movie) {
      return MovieCommentModel.getMovieCommentsCount(movie._id).then(function (moviecount) {
        movie.moviecommentsCount = moviecount
        return movie
      })
    }
    return movie
  }
})

// 将 电影信息 的 content 从 markdown 转换成 html
Movie.plugin('contentToHtml', {
  afterFind: function (movies) {
    return movies.map(function (movie) {
      movie.bio = marked(movie.bio)
      return movie
    })
  },
  afterFindOne: function (movie) {
    if (movie) {
      movie.bio = marked(movie.bio)
    }
    return movie
  }
})

module.exports = {
  // 创建一篇文章
  create: function create (movie) {
    return Movie.create(movie).exec()
  },

  //通过movieId获取一部电影
  getMovieById: function getMovieById (movieId) {
    return Movie
      .findOne({ _id: movieId })
      .populate({ path: 'author', model: 'User'})//关联user，填充author
      .addCreatedAt()
      //.addMovieCommentsCount()
      .contentToHtml()
      .exec()
  },

  // 按创建时间降序获取所有电影
  getMovies: function getMovies (author) {
    const query = {}
    if(author) {
      query.author = author
    }
    return Movie
      .find(query)
      .populate({path:'author', model: 'User' })
      .sort({ _id:-1 })
      .addCreatedAt()
      //.addMovieCommentsCount()
      .contentToHtml()
      .exec()
  },

  // 通过电影 id 获取一部电影(编辑电影)
  getRawMovieById: function getRawMovieById (movieId) {
    return Movie
      .findOne({ _id: movieId })
      .populate({ path: 'author', model: 'User' })
      .exec()
  },

  // 通过电影 id 更新一部电影
  updateMovieById: function updateMovieById (movieId, data) {
    return Movie.update({ _id: movieId }, { $set: data }).exec()
  },

  // 通过电影 id 删除一部电影
  delMovieById: function delMovieById (movieId, author) {
    return Movie.deleteOne({author: author, _id: movieId})
      .exec()
      .then(function (res) {
        if (res.result.ok && res.result.n > 0) {
          return MovieCommentModel.delMovieCommentsByMovieId(movieId)
        }
      })

  }
}
