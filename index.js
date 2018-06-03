/**
 * Created by Eric on 2018/3/31.
 */

const path = require('path')
const express = require('express')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const flash = require('connect-flash')//提示模块
const config = require('config-lite')(__dirname)//检查配置文件模块
const routes = require('./routes')
const pkg = require('./package')
const winston = require('winston')//记录日志需要的模块
const expressWinston = require('express-winston')//记录日志需要的模块

const app = express()

//设置模板目录
app.set('views', path.join(__dirname, 'views'))
// 设置引擎模板为ejs
app.set('view engine', 'ejs')

// 设置静态文件目录
app.use(express.static(path.join(__dirname, 'public')))
//session 中间件
app.use(session({
  name: config.session.key, // 设置 cookie 中保存 session id 的字段名称
  secret: config.session.secret, // 通过设置 secret 来计算 hash 值并放在 cookie 中，使产生的 signedCookie 防篡改
  resave: false, // 强制更新 session
  saveUnintialized: true, // 设置为 false，强制创建一个 session，即使用户未登录
  cookie: {
    maxAge: config.session.maxAge// 过期时间，过期后 cookie 中的 session id 自动删除
  },
  store: new MongoStore({// 将 session 存储到 mongodb
    url: config.mongodb //mongodb地址
  })
}))
//flash中间件，用来显示通知
app.use(flash())

//处理表单及文件上传的中间件
app.use(require('express-formidable')({
  uploadDir: path.join(__dirname, 'public/img'), //上传文件目录
  keepExtensions: true//保留后缀
}))


// app.locals 和 res.locals都用来渲染模板
//设置模板全局常量
app.locals.blog = {//挂载常量信息,此处是blog
  title: pkg.name,
  description: pkg.description
}

//添加模板必须的三个变量
app.use(function (req, res, next) {//挂载变量信息，此处是user、success和flash三个变量
  res.locals.user = req.session.user
  res.locals.success = req.flash('success').toString()
  res.locals.error = req.flash('error').toString()
  next()
})

//正常请求的日志
app.use(expressWinston.logger({
  transports: [
    new (winston.transports.Console)({
      json: true,
      colorize: true
    }),
    new winston.transports.File({
      filename: 'logs/success.log'
    })
  ]
}))

//路由
routes(app)

//错误请求日志
app.use(expressWinston.errorLogger({
  transports: [
    new winston.transports.Console({
      json: true,
      colorize: true
    }),
    new winston.transports.File({
      filename: 'logs/error.log'
    })
  ]
}))

//错误页面处理：通知错误信息并跳转到主页
app.use(function (err, req, res, next) {
  console.error(err)
  req.flash('error', err.message)
  res.redirect('/posts')
})

// 监听端口，启动程序
if (module.parent) {
  // 被 require，则导出 app
  module.exports = app
} else {
  // 监听端口，启动程序
  app.listen(config.port, function () {
    console.log(`${pkg.name} listening on port ${config.port}`)
  })
}
