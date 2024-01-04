const http = require('http')

class Koa {
  middleware = []

  constructor() {
    
  }

  use(fn) {
    this.middleware.push(fn)
    return this
  }

  createContext(req, res) {
    return {
      req: {
        value: [0]
      },
      res: {
        value: [0],
        statusCode: null
      },
      onerror() {
        throw new Error('err')
      }
    }
  }

  handleRequest(ctx, fnMiddleware) {
    console.log(ctx)
    const res = ctx.res
    res.statusCode = 404
    const onerror = err => ctx.onerror(err)
    const handleResponse = () => respond(ctx)
    return fnMiddleware(ctx).then(handleResponse).catch(onerror)
  }

  callback() {
    const fn = compose(this.middleware)
    const handleRequest = (req, res) => {
      const ctx = this.createContext(req, res)
      return this.handleRequest(ctx, fn)
    }
    return handleRequest
  }

  listen(...args) {
    const server = http.createServer(this.callback())
    console.log(...args)
    server.listen(...args)
    // console.log(server)
  }
}

function respond(ctx) {
  const res = ctx.res
  return res.end(JSON.stringify(ctx.body))
}

function compose (middleware) {
  if (!Array.isArray(middleware)) throw new TypeError('Middleware stack must be an array!')
  for (const fn of middleware) {
    if (typeof fn !== 'function') throw new TypeError('Middleware must be composed of functions!')
  }

  /**
   * @param {Object} context
   * @return {Promise}
   * @api public
   */

  return function (context, next) {
    // last called middleware #
    let index = -1
    return dispatch(0)
    function dispatch (i) {
      if (i <= index) return Promise.reject(new Error('next() called multiple times'))
      index = i
      let fn = middleware[i]
      if (i === middleware.length) fn = next
      if (!fn) return Promise.resolve()
      try {
        return Promise.resolve(fn(context, dispatch.bind(null, i + 1)));
      } catch (err) {
        return Promise.reject(err)
      }
    }
  }
}

const app = new Koa()
app.use(async (ctx, next) => {
  ctx.req.value.push(1)
  await next()
  console.log(1)
})

app.use(async (ctx, next) => {
  ctx.req.value.push(2)
  await next()
  console.log(2)
})

app.use(async (ctx, next) => {
  ctx.req.value.push(3)
  await next()
  console.log(3)
})
app.listen(3002)
