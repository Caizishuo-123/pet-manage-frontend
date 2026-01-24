import axios from 'axios'
import router from '@/router'

const request = axios.create({
  // 使用 vite 代理，不需要 baseURL
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

// 响应拦截器 - 处理响应和错误
request.interceptors.response.use(
  response => response.data,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
      router.push('/login')
    }
    return Promise.reject(error)
  }
)

export default request