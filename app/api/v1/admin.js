const Router = require('koa-router')
const { AdminDao } = require('@dao/admin')
const { Resolve } = require('@lib/helper')
const { LoginManager } = require('@service/login')
const { Auth } = require('@middlewares/auth')
const {
  RegisterValidator,
  AdminLoginValidator
} = require('@validators/admin')


const res = new Resolve()
const AUTH_ADMIN = 16;

const router = new Router({
  prefix: '/api/v1/admin'
})

// 管理员注册
router.post('/register', async (ctx) => {
  // 创建管理员
  // 通过验证器校验参数是否通过
  const v = await new RegisterValidator().validate(ctx);
  const [err, data] = await AdminDao.create({
    email: v.get('body.email'),
    password: v.get('body.password2'),
    nickname: v.get('body.nickname')
  })

  if (!err) {
    ctx.response.status = 200
    ctx.body = res.json(data)
  } else {
    ctx.body = res.fail(err)
  }
})

// 管理员登录
router.post('/login', async (ctx) => {
  const v = await new AdminLoginValidator().validate(ctx)

  const [err, token, adminId] = await LoginManager.adminLogin({
    email: v.get('body.email'),
    password: v.get('body.password')
  })

  if (!err) {
    ctx.session = {
      user_id: adminId,
      count: 0
    }
    ctx.response.status = 200;
    ctx.body = res.json({ token })
  } else {
    ctx.body = res.fail(err, err.msg);
  }
})

// 获取用户信息
router.get('/auth', new Auth(AUTH_ADMIN).m, async (ctx) => {
  // 获取用户id
  const id = ctx.auth.uid

  let [err, data] = await AdminDao.detail(id)

  if (!err) {
    ctx.response.status = 200
    ctx.body = res.json(data)
  } else {
    ctx.body = res.fail(err)
  }
})



module.exports = router
