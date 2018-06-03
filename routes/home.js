/**
 * Created by Eric on 2018/5/30.
 */
const express = require('express')
const router = express.Router();

// GET /home 网站首页
router.get('/', function (req, res, next) {
  //向豆瓣电影api发起请求

  res.render('home',{
    title: 'xx',
    imgurl:'xx'
  })
})


module.exports = router;
