/**
 * 宠物管理 API
 */
import request from '@/utils/request'

/**
 * 分页获取宠物列表
 * @param {Object} params - 查询参数
 * @param {string} [params.name] - 宠物名称
 * @param {number} [params.type] - 类型：1-猫 2-狗
 * @param {string} [params.breed] - 品种
 * @param {number} [params.status] - 状态
 * @param {number} [params.source] - 来源
 * @param {number} [params.gender] - 性别
 * @param {number} [params.page=1] - 页码
 * @param {number} [params.pageSize=10] - 每页条数
 * @returns {Promise}
 */
export function getPetPage(params) {
  return request.get('/admin/pet/page', { params })
}
