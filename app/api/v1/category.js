const Router = require('koa-router')
const {
  CategoryValidator,
  PositiveIdParamsValidator
} = require('@validators/category')
const { CategoryDao } = require('@dao/category')
const { Auth } = require('@middlewares/auth');

const { Resolve } = require('@lib/helper');
const res = new Resolve();

const AUTH_ADMIN = 16;

const router = new Router({
  prefix: '/api/v1/category'
})

// 创建分类
router.post('/create', new Auth(AUTH_ADMIN).m, async (ctx) => {

  const v = await new CategoryValidator().validate(ctx)
  // 创建文章分类
  const [err, data] = await CategoryDao.create({
    name: v.get('body.name'),
    status: v.get('body.status'),
    sort_order: v.get('body.sort_order'),
    parent_id: v.get('body.parent_id')
  })

  if (!err) {
    ctx.response.status = 200
    ctx.body = res.json(data)
  } else {
    ctx.body = res.fail(err)
  }
})

// 获取分类详情
router.get('/detail/:id', async (ctx) => {
  const v = await new PositiveIdParamsValidator().validate(ctx)
  const id = v.get('path.id')
  const [err, data] = await CategoryDao.detail(id)

  if (!err) {
    ctx.response.status = 200
    ctx.body = res.json(data)
  } else {
    ctx.body = res.fail(err)
  }
})

// 删除分类
router.post('/destroy/:id', new Auth(AUTH_ADMIN).m, async (ctx) => {
  const v = await new PositiveIdParamsValidator().validate(ctx)
  const id = v.get('path.id')
  const [err, data] = await CategoryDao.destroy(id)

  if (!err) {
    ctx.response.status = 200
    ctx.body = res.success('删除分类成功')
  } else {
    ctx.body = res.fail(err)
  }
})

// 更新分类
router.post('/update/:id', new Auth(AUTH_ADMIN).m, async (ctx) => {
  const v = await new PositiveIdParamsValidator().validate(ctx)

  const id = v.get('path.id')
  const [err, data] = await CategoryDao.update(id, v)

  if (!err) {
    ctx.response.status = 200
    ctx.body = res.success('更新分类成功')
  } else {
    ctx.body = res.fail(err)
  }
})

// 获取分类列表
router.get('/list', async (ctx) => {
  const [err, data] = await CategoryDao.list(ctx.query)
  
  if (!err) {
    ctx.response.status = 200
    ctx.body = res.json(data)
  } else {
    ctx.body = res.fail(err)
  }
})

module.exports = router