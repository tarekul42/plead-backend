export function success<T>(data: T, meta?: object) {
  return { success: true, data, ...(meta ? { meta } : {}) };
}

export function error(code: string, message: string, details?: object) {
  return { success: false, error: { code, message, ...(details ? { details } : {}) } };
}
