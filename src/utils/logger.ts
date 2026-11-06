export function logInfo(msg: string, meta?: any) {
  if (meta) console.log(`[INFO] ${msg}`, meta)
  else console.log(`[INFO] ${msg}`)
}

export function logError(msg: string, meta?: any) {
  if (meta) console.error(`[ERROR] ${msg}`, meta)
  else console.error(`[ERROR] ${msg}`)
}
