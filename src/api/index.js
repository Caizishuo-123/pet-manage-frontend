/**
 * API 统一导出
 * 
 * 使用示例:
 * import { authApi, userApi, petServiceApi } from '@/api'
 * 
 * authApi.login('admin', '123456')
 * userApi.getUserPage({ page: 1, pageSize: 10 })
 * petServiceApi.getServicePage({ page: 1, pageSize: 10 })
 */

import * as authApi from './auth'
import * as userApi from './user'
import * as petApi from './pet'
import * as petServiceApi from './petService'
import * as appointmentApi from './appointment'
import * as ordersApi from './orders'
import * as adoptionApi from './adoption'
import * as postApi from './post'
import * as commentApi from './comment'

export {
  authApi,
  userApi,
  petApi,
  petServiceApi,
  appointmentApi,
  ordersApi,
  adoptionApi,
  postApi,
  commentApi
}

