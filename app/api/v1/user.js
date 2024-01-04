const Router = require('koa-router')
const { UserDao } = require('@dao/user')

const router = new Router({
  prefix: '/api/v1/user'
})
