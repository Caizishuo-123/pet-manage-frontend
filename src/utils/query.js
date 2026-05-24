/**
 * 从路由 query 中安全取值（可能是数组或单值）
 */
export function getQueryValue(value) {
  return Array.isArray(value) ? value[0] : value
}

/**
 * 转为字符串，null/undefined 返回空串
 */
export function toStringOrEmpty(value) {
  const raw = getQueryValue(value)
  return raw == null ? '' : String(raw)
}

/**
 * 转为数字，无法解析时返回 undefined
 */
export function toNumberOrUndefined(value) {
  const raw = getQueryValue(value)
  if (raw == null || raw === '') return undefined
  const num = Number(raw)
  return Number.isFinite(num) ? num : undefined
}
