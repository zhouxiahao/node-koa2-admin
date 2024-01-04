const { Op } = require('sequelize')

const { Article } = require('@models/article')
const { Category } = require('@models/category')
const { Admin } = require('@models/admin')
const { isArray, unique } = require('@lib/utils')


class ArticleDao {
  
  // 创建文章
  static async create(v) {
    const title = v.get('body.title')
    const hasArticle = await Article.findOne({
      where: {
        title,
        delete_at: null
      }
    })

    if (hasArticle) throw new global.errs.Existing('文章已存在')

    const article = new Article()
    article.title = title;
    article.description = v.get('body.description')
    article.img_url = v.get('body.img_url')
    article.content = v.get('body.content')
    article.seo_keyword = v.get('body.seo_keyword')
    article.status = v.get('body.status') || 1
    article.sort_order = v.get('body.sort_order')
    article.admin_id = v.get('body.admin_id')
    article.category_id = v.get('body.category_id')

    try {
      const res = await article.save()
      return [null, res]
    } catch (err) {
      return [err, null]
    }
  }

  // 删除文章
  static async destroy(id) {
    const article = await Article.findOne({
      where: id,
      deleted_at: null
    })

    if (!article) throw new global.errs.Existing('不存在当前文章')

    try {
      const res = await article.destroy()
      return [null, res]
    } catch (err) {
      return [err, null]
    }
  }

  // 更新文章
  static async update(id, v) {
    // 查询文章
    const article = await Article.findByPk(id);
    if (!article) {
      throw new global.errs.NotFound('没有找到相关文章');
    }

    article.title = v.get('body.title')
    article.description = v.get('body.description')
    article.img_url = v.get('body.img_url')
    article.content = v.get('body.content')
    article.seo_keyword = v.get('body.seo_keyword')
    article.status = v.get('body.status')
    article.sort_order = v.get('body.sort_order')
    article.admin_id = v.get('body.admin_id')
    article.category_id = v.get('body.category_id')

    try {
      const res = await article.save()
      return [null, re]
    } catch (err) {
      return [err, null]
    }
  }

  // 获取文章详情
  static async detail(id, query) {
    try {
      let filter = {
        id,
        deleted_at: null
      }

      let article = await Article.findOne({
        where: filter
      })

      const [categoryErr, dataAndCategory] = await ArticleDao
        ._handleCategory(article, article.category_id)

      if  (!categoryErr) {
        article = dataAndCategory
      }

      // 处理创建人
      const [userError, dataAndAdmin] = await ArticleDao._handleAdmin(article, article.admin_id)
      
      if (!userError) {
        article = dataAndAdmin
      }

      if (!article) {
        throw new global.errs.NotFound('没有找到相关文章');
      }

      return [null, article]
    } catch (err) {
      return [err, null]
    }
  }

  // 获取文章列表
  static async list(params={}) {
    const {
      category_id,
      keyword,
      page_size = 10,
      status,
      page = 1
    } = params

    const filter = {
      deleted_at: null
    }

    // 状态筛选，0-隐藏，1-正常
    if (status || status === 0) {
      filter.status = status
    }

    // 筛选方式：存在分类ID
    if (category_id) {
      filter.category_id = category_id;
    }

    // 筛选方式：存在搜索关键字
    if (keyword) {
      filter.title = {
        [Op.like]: `%${keyword}%`
      };
    }

    try {
      const article = await Article.scope('iv').
        findAndCountAll({
          limit: page_size, //每页10条
          offset: (page - 1) * page_size,
          where: filter,
          order: [
            ['created_at', 'DESC']
          ]
        })
        
      let rows = article.rows

      // 处理分类
      const categoryIds = unique(rows.map(item => item.category_id))
      const [categoryError, dataAndCategory] = await Article
        ._handleCategory(rows, categoryIds)
      
      if (!categoryError) {
        rows = dataAndCategory
      }

      // 处理管理员信息
      const adminIds = unique(rows.map(item => item.admin_id))
      const [adminError, dataAndAndmin] = await ArticleDao._handleAdmin(rows, adminIds)

      if (!adminError) {
        rows = dataAndAndmin
      }

      if (isArray(rows) && rows.length > 0) {
        rows.sort((a, b) => b.sort_order > a.sort_order)
      }

      const data = {
        data: rows,
        // 分页
        meta: {
          current_page: parseInt(page),
          per_page: 10,
          count: article.count,
          total: article.count,
          total_page: Math.ceil(article.count / 10)
        }
      }
      return [null, data]
    } catch (err) {
      return [err, null]
    }
  }

  static async _handleCategory(data, ids) {
    const finner = {
      where: {
        id: {}
      },
      attributes: ['id', 'name']
    }

    if (isArray(ids)) {
      finner.where.id = {
        [Op.in]: ids
      }
    } else {
      finner.where.id = ids
    }

    try {
      if (isArray(ids)) {
        const res = await Category.findAll(finner)
        const category = {}
        
        res.forEach(item => {
          category[item.id] = item
        })

        data.forEach(item => {
          item.setDataValue('category_info', category[item.category_id] || null)
        })
      } else {
        const res = await Category.findOne(finner)
        data.setDataValue('category_info', res)
      }
      return [null, data]
    } catch (err) {
      return [err, null]
    }
  }

  static async _handleAdmin(data, ids) {
    const finner = {
      where: {
        id: {}
      },
      attributes: ['id', 'email', 'nickname']
    }

    if (isArray(ids)) {
      finner.where.id = {
        [Op.in]: ids
      }
    } else {
      finner.where.id = ids
    }

    try {
      if (isArray(ids)) {
        const res = await Admin.findAll(finner)
        const admin = {}

        res.forEach(item => {
          admin[item.id] = item
        })

        data.forEach(item => {
          item.setDataValue('admin_info', admin[item.admin_id] || null)
        })
      } else {
        const res = await Admin.findOne(finner)
        data.setDataValue('admin_info', res)
      }
      return [null, data]
    } catch (err) {
      return [err, null]
    }
  }
}

module.exports = {
  Article
}