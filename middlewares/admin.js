/**
 * Created by Eric on 2018/6/3.
 */
//增加一给管理员验证中间件
module.exports = {
  checkLogin: function checkLogin (req, res, next) {
    if (!req.session.user) {
      req.flash('error', '未登录')
      return res.redirect('/signin')
    }
    if (req.session.user.name != 'admin') {
      req.flash('error', '未登录')
      return res.redirect('/adminsignin')
    }
    next()
  },

  checkNotLogin: function checkNotLogin (req, res, next) {
    if (req.session.user) {
      req.flash('error', '已登录')
      return res.redirect('back')// 返回之前的页面
    }
    next()
  }
}
