const Router = require('koa-router')
const {
  ArticleValidator,
  PositiveIdParamsValidator,
  ArticleSearchValidator
} = require('@validators/article')
const { ArticleDao } = require('@dao/article');
const hljs = require('highlight.js');
const md = require('markdown-it')({
  highlight: function(str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return '<pre class="hljs"><code>' +
          hljs.highlight(str, {
            language: lang,
            ignoreIllegals: true
          }).value + '</code></pre>'
      } catch(__) {}
    }

    return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>'
  }
})
const { Auth } = require('@middlewares/auth')

const AUTH_ADMIN = 16


const router = new Router({
  prefix: '/api/v1'
})

router.post('/article', new Auth(AUTH_ADMIN).m, async (ctx) => {
  const v = new ArticleValidator().validate(ctx)

  // 创建文章
  const [err, data] = await ArticleDao.create(v)
  if (!err) {
    // 返回结果
    ctx.response.status = 200
    ctx.body = res.success('创建文章成功')
  } else {
    ctx.body = res.fail(err)
  }
})

// 删除文章
router.post('/destroy/:id', new Auth(AUTH_ADMIN).m, async (ctx) => {
  const v = await new PositiveIdParamsValidator().validate(ctx)
  const id = v.get('path.id')

  const [err, data] = await ArticleDao.destroy(id, v)

  if (!err) {
    ctx.response.status = 200
    ctx.body = res.success('删除成功')
  } else {
    ctx.body = res.fail(err)
  }
})

// 更新文章
router.post('/update/:id', new Auth(AUTH_ADMIN).m, async (ctx) => {
  const v = await new PositiveIdParamsValidator().validate(ctx)
  const id = v.get('path.id')

  const [err, data] = await ArticleDao.update(id, v)
  if (!err) {
    ctx.response.status = 200
    ctx.body = res.success('更新文章')
  } else {
    ctx.body = res.fail(err)
  }
})

// 获取文章列表
router.get('/list', async (ctx) => {
  const [err, data] = await ArticleDao.list(ctx.query)
  
  if (!err) {
    ctx.response.status = 200
    ctx.body = res.json(data)
  } else {
    ctx.body = res.fail(err)
  }
})

// 获取文章详情
router.get('/article/:id', async (ctx) => {
  const v = await new PositiveIdParamsValidator().validate(ctx)
  const id = v.get('path.id')

  const [err, data] = await ArticleDao.detail(id, ctx.query)

  if (!err) {
    if (ctx.query.is_markdown) {
      data.content = md.render(data.content)
    }

    ctx.response.status = 200
    ctx.body = res.json(data)
  } else {
    ctx.body = res.fail(err)
  }
})

module.exports = router