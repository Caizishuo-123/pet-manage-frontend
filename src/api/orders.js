/**
 * 订单管理 API
 */
import request from '@/utils/request'

/**
 * 分页获取订单列表
 * @param {Object} params - 查询参数
 * @param {number} [params.userId] - 用户ID
 * @param {string} [params.orderNo] - 订单编号
 * @param {number} [params.payStatus] - 支付状态：0-未支付 1-已支付
 * @param {number} [params.page=1] - 页码
 * @param {number} [params.pageSize=10] - 每页条数
 * @returns {Promise}
 */
export function getOrderPage(params) {
  return request.get('/admin/orders/page', { params })
}

/**
 * 获取订单详情
 * @param {number} id - 订单ID
 * @returns {Promise}
 */
export function getOrderDetail(id) {
  return request.get(`/admin/orders/${id}`)
}

/**
 * 更新支付状态
 * @param {number} id - 订单ID
 * @param {number} payStatus - 支付状态：0-未支付 1-已支付
 * @param {number} [payMethod] - 支付方式：1-微信 2-支付宝
 * @returns {Promise}
 */
export function updatePayStatus(id, payStatus, payMethod) {
  const params = { id, payStatus }
  if (payMethod !== undefined) {
    params.payMethod = payMethod
  }
  return request.put('/admin/orders/payStatus', null, { params })
}

/**
 * 删除订单
 * @param {number} id - 订单ID
 * @returns {Promise}
 */
export function deleteOrder(id) {
  return request.delete(`/admin/orders/delete/${id}`)
}
