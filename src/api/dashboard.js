import request from '@/utils/request'

/**
 * 管理端仪表盘 API
 */

export function getDashboardSummary() {
  return request.get('/admin/dashboard/summary')
}

export function getDashboardTrends(days = 7) {
  return request.get('/admin/dashboard/trends', { params: { days } })
}

