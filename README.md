## 项目介绍
> 个人博客的搭建
采用的技术债：
- Node.js + Koa2 + MySQL 开发的一套完整的Restful api
- 问题：什么是Restful api?
### 开发流程
#### 从注册到登录的整个实现流程
  1. sequelize库来连接操作数据库: https://www.sequelize.cn/core-concepts/model-basics
    - todo: 查阅sequelize文档
  2. koa-bodyparser: 获取post中提交的参数
  3. 定义了一套规则校验，通过自定义的拦截中间件捕捉错误返回
    - validator
    - custom middleware
  4. 
#### 公共模块
  1. 封装了一套检验规则
  2. 全局的代码捕捉分类报错
  3. 中间件过滤：权限，http权限拦截