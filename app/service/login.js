const { AdminDao }  = require('@dao/admin')
const { generateToken } = require('@core/utils')
const { Auth } = require('@middlewares/auth')

class LoginManager {
  static async adminLogin(params) {
    let { email, password } = params

    // 验证密码的正确性
    const [err, admin] = await AdminDao.verify(email, password)

    if (!err) {
      return [null, generateToken(admin.id, Auth.ADMIN), admin.id]
    } else {
      return [err, null]
    }
  }
}

module.exports = {
  LoginManager
}