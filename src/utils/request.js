import axios from 'axios'
import router from '@/router'

const request = axios.create({
  baseURL: 'http://localhost:8081',  // 后端地址
  timeout: 10000
})

// 请求拦截器 - 自动添加 Token
request.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 响应拦截器 - 处理 401
request.interceptors.response.use(
  response => response.data,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      router.push('/login')
    }
    return Promise.reject(error)
  }
)

export default request