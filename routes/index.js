/**
 * Created by Eric on 2018/3/31.
 */
module.exports = function (app) {
  app.get('/', function (req, res) {
    res.redirect('/home')
  })

  app.use('/adminsignin',require('./adminsignin'))//管理员登录界面
  app.use('/admin',   require('./admin'))//管理员界面
  app.use('/signup',  require('./signup'))  //注册
  app.use('/signin',  require('./signin'))  //登录
  app.use('/signout', require('./signout')) //登出
  app.use('/posts',   require('./posts'))   //发表
  app.use('/home',    require('./home'))  //主页
  app.use('/comments', require('./comments'))//博客留言
  app.use('/moviecomments', require('./moviecomments'))//电影评论

  // 404 page
  app.use(function (req, res) {
    if (!res.headersSent){
      res.status(404).render('404')
    }
  })

}
