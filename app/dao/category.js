const { Category } = require('@models/category')
const { param } = require('../api/v1/category')


class CategoryDao {
  // 创建分类
  static async create(params = {}) {
    const {
      name,
      sort_order = 1,
      parent_id = 0
    } = params

    // 查询是否存在重复的分类
    const hasCategory = await Category.findOne({
      where: {
        name,
        deleted_at: null
      }
    })

    if (hasCategory) throw new global.errs.Existing('分类已存在')
  
    const category = new Category()
    category.name = name
    category.sort_order = sort_order
    category.parent_id = parent_id

    try {
      const res = await category.save()
      const data = {
        name: res.name,
        key: res.key,
        parent_id: res.parent_id,
        msg: '创建成功'
      }
      return [null, data]
    } catch (err) {
      return [err, null]
    }
  }

  // 获取分类详情
  static async detail(id) {
    try {
      const category = await Category.scope('bh').findOne({
        where: {
          id,
          deleted_at: null
        }
      })

      if (!category) throw new global.errs.NotFound('没有找到相关分类')
      
      return [null, category]
    } catch (err) {
      return [err, null]
    }
  }

  // 删除分类
  static async destroy(id) {
    const category = await Category.findByPk(id)
    
    if (!category) throw new global.errs.NotFound('没有找到相关分类')

    try {
      const res = await category.destroy()
      return [null, res]
    } catch (err) {
      return [err, null]
    }

  }

  // 更新分类
  static async update(id, v) {
    const category = await Category.findByPk(id)
    
    if (!category) throw new global.errs.NotFound('没有找到相关分类')

    category.name = v.get('body.name');
    category.status = v.get('body.status');
    category.sort_order = v.get('body.sort_order');
    category.parent_id = v.get('body.parent_id') || 0;

    try {
      const res = await category.save()
      return [null, res]
    } catch (err) {
      return [err, null]
    }
  }

  // 获取所有分类
  static async list(query = {}) {
    const {
      status,
      name,
      id,
      page_size = 10,
      page = 1
    } = query
    const params = {}
    
    if (id) {
      params.id = id
    }

    if (name) {
      params.name = {
        [Op.like]: `%${name}%`
      }
    }

    if (status) {
      params.status = status
    }

    try {
      const categories =  await Category.scope('bh').findAndCountAll({
        where: params,
        limit: page_size,
        offset: (page - 1) * page_size,
        order: [
          ['created_at', 'DESC']
        ]
      })
      const data = {
        data: categories.rows,
        meta: {
          current_page: parseInt(page),
          per_page: 10,
          count: categories.count,
          total: categories.count,
          total_pages: Math.ceil(categories.count / 10),
          test: 'go'
        }
      }
      return [null, data]
    } catch (err) {
      return [err, null]
    }
  }
}

module.exports = {
  CategoryDao
}