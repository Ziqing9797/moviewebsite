/**
 * Created by Eric on 2018/4/1.
 */
const User = require('../lib/mongo').User

module.exports = {
  //注册一个用户
  create: function create (user) {
    return User.create(user).exec()
  }
}