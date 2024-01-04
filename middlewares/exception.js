const { HttpException } = require('@core/http-exception')

const catchError = async (ctx, next) => {
  try {
    await next()
  } catch (error) {
    // 开发环境
    const isHttpException = error instanceof HttpException
    const isDev = global.config.enviroment === 'dev'

    if (isDev && !isHttpException) {
      throw error
    }

    // 生存环境
    if (isHttpException) {
      ctx.body = {
        msg: error.msg,
        error_code: error.errorCode,
        request: `${ctx.method} ${ctx.path}`
      }
      ctx.response.status = 500
    }
  }
}

module.exports = catchError