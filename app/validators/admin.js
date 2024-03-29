const {
  Rule,
  LinValidator
} = require('@core/lin-validator-v2')


class RegisterValidator extends LinValidator {
  constructor() {
    super()
    this.email = [
      new Rule('isEmail', '电子邮箱不符合规范，请输入正确的邮箱')
    ]
    this.password1 = [
      new Rule('isLength', '密码至少6个字符，最多22个字符', {
        min: 6,
        max: 22
      }),
      new Rule(
        'matches',
        '密码长度必须在6~22位之间，包含字符、数字和 _ ',
        '^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]'
      )
    ]
    this.password2 = this.password1
    this.nickname = [
      new Rule('isLength', '昵称长度必须在2~16之间', {
        min: 2,
        max: 16
      }),
    ]
  }

  validatePassword(vals) {
    const psw1 = vals.body.password1
    const psw2 = vals.body.password2
    if (psw1 !== psw2) {
      throw new Error('两次输入的密码不一致，请重新输入')
    }
  }
}

class AdminLoginValidator extends LinValidator {
  constructor() {
    super()
    this.email = [
      new Rule('isEmail', '电子邮箱不符合规范，请输入正确的邮箱')
    ]
    this.password = [
      new Rule('isLength', '密码至少6个字符，最多22个字符', {
        min: 6,
        max: 22
      }),
      new Rule(
        'matches',
        '密码长度必须在6~22位之间，包含字符、数字和 _ ',
        '^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]'
      )
    ]
  }
}

module.exports = {
  RegisterValidator,
  AdminLoginValidator
}
