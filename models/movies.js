/**
 * Created by Eric on 2018/6/2.
 */
//电影信息
const Movie = require('../lib/mongo').Movie


module.exports = {
  // 创建一篇文章
  create: function create (movie) {
    return Movie.create(movie).exec()
  }
}
