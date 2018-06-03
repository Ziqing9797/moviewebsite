/**
 * Created by Eric on 2018/3/31.
 */
module.exports = {
  port: 3000,
  session: {
    secret: 'movieweb',
    key: 'movieweb',
    maxAge: 2592000000
  },
  mongodb: 'mongodb://localhost:27017/movieweb'
}
