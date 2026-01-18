import crypto from 'crypto'

const HASH_PREFIX = 'scrypt'
const SALT_BYTES = 16
const KEY_BYTES = 64

function hashPassword(password) {
  const salt = crypto.randomBytes(SALT_BYTES).toString('base64')
  const hash = crypto.scryptSync(password, salt, KEY_BYTES).toString('base64')
  return `${HASH_PREFIX}$${salt}$${hash}`
}

function verifyPassword(password, stored) {
  if (!stored || typeof stored !== 'string') {
    return { ok: false, isLegacy: false }
  }

  if (!stored.startsWith(`${HASH_PREFIX}$`)) {
    return { ok: password === stored, isLegacy: true }
  }

  const parts = stored.split('$')
  if (parts.length !== 3) {
    return { ok: false, isLegacy: false }
  }

  const [, salt, expectedHash] = parts
  const actualHash = crypto.scryptSync(password, salt, KEY_BYTES).toString('base64')
  const ok = timingSafeEqualBase64(actualHash, expectedHash)
  return { ok, isLegacy: false }
}

function timingSafeEqualBase64(a, b) {
  try {
    const bufA = Buffer.from(a, 'base64')
    const bufB = Buffer.from(b, 'base64')
    if (bufA.length !== bufB.length) return false
    return crypto.timingSafeEqual(bufA, bufB)
  } catch (error) {
    return false
  }
}

export { hashPassword, verifyPassword }
