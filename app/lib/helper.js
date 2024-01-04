class Resolve {
  fail(err = {}, msg = '操作失败', errorCode = 10001) {
    return {
      msg,
      err,
      errorCode
    }
  }

  success(msg = 'Success', errorCode = 0, code = 200) {
    return {
      code,
      msg,
      errorCode
    }
  }

  json(data, msg = 'Success', errorCode = 0, code = 200) {
    return {
      code,
      msg,
      errorCode,
      result: data
    }
  }
}

module.exports = {
  Resolve
}