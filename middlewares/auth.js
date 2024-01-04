const basicAuth = require('basic-auth')
const jwt = require('jsonwebtoken')
// TODO: 搞清楚jsonwebtoken的用法
// TODO: 中间件用法
// TODO: GENERATOR 和 async原理

class Auth {
  
  constructor(level) {
    Auth.USER = 8
    Auth.ADMIN = 16
    Auth.SUPER_ADMIN = 32
    this.level = level || 1
  }

  get m() {
    return async (ctx, next) => {
      const tokenToken = basicAuth(ctx.req)
      console.log('tokenToken: ', tokenToken)

      let errMsg = "无效的token";
      // 无带token
      if (!tokenToken || !tokenToken.name) {
        errMsg = "需要携带token值";
        throw new global.errs.Forbidden(errMsg);
      }

      try {
        var decode = jwt.verify(
          tokenToken.name,
          global.config.security.secretKey
        )
      } catch (err) {
        if (error.name === 'TokenExpiredError') {
          errMsg = 'token已过期'
        }

        throw new global.errs.Forbidden(errMsg)
      }

      if (decode.scope < this.level) {
        errMsg = "权限不足"
        throw new global.errs.Forbidden(errMsg);
      }

      ctx.auth = {
        uid: decode.uid,
        scope: decode.scope
      }

      await next()
    }
  }
}

module.exports = {
  Auth
}