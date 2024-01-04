const jwt = require('jsonwebtoken')


const findMembers = function (instance, {
  prefix,
  specifiedType,
  filter
}) {
  function _find(instance) {
    if (!instance.__proto__) return []

    let names = Reflect.ownKeys(instance)
    names = names.filter((name) => {
      return _shouldKeep(name)
    })

    return [...names, ..._find(instance.__proto__)]
  }

  function _shouldKeep(value) {
    if (filter) {
      if (filter(value)) {
        return true
      }
    }

    if (prefix) {
      // startsWith() 方法用来判断当前字符串是否以另外一个给定的子字符串开头，并根据判断结果返回 true 或 false。
      if (value.startsWith(prefix)) return true
    }
  
    if (specifiedType)
      if (instance[value] instanceof specifiedType)
        return true
  }

  return _find(instance)
}

// 颁布令牌
const generateToken = function (uid, scope) {
  const secretKey = global.config.security.secretKey
  const expiresIn = global.config.security.expiresIn
  const token = jwt.sign({
    uid,
    scope
  }, secretKey, {
    expiresIn
  })
  return token

}

module.exports = {
  findMembers,
  generateToken
}