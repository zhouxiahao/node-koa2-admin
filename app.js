const Koa = require('koa') // 用的是Koa框架
const InitManager = require('./core/init') // 管理路由
require('module-alias/register')
const parser = require('koa-bodyparser')
const cors = require('@koa/cors')
const catchError = require('./middlewares/exception')
const app = new Koa()

app.use(cors())
app.use(catchError)
app.use(parser())

InitManager.initCore(app)

app.listen(6688, () => {
  console.log('Koa is listening in http://localhost:6688')
})

module.exports = app