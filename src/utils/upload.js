import { ElMessage } from 'element-plus'

/**
 * 图片上传前的格式和大小校验，可用于 el-upload 的 before-upload
 */
export function beforeAvatarUpload(rawFile) {
  const isValidFormat =
    rawFile.type === 'image/jpeg' ||
    rawFile.type === 'image/png' ||
    rawFile.type === 'image/webp'
  const isLt5M = rawFile.size / 1024 / 1024 < 5

  if (!isValidFormat) {
    ElMessage.error('上传图片只能是 JPG/PNG/WEBP 格式!')
  }
  if (!isLt5M) {
    ElMessage.error('上传图片大小不能超过 5MB!')
  }
  return isValidFormat && isLt5M
}
