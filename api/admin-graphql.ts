import type { VercelRequest, VercelResponse } from '@vercel/node'

const NEON_AUTH_BASE_URL = process.env.NEON_AUTH_BASE_URL!
const HASURA_GRAPHQL_URL = process.env.HASURA_GRAPHQL_URL!
const HASURA_ADMIN_SECRET = process.env.HASURA_ADMIN_SECRET!

interface JwtPayload {
  sub?: string
  iss?: string
  exp?: number
  [key: string]: unknown
}

function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const json = Buffer.from(payload, 'base64').toString('utf8')
    return JSON.parse(json) as JwtPayload
  } catch {
    return null
  }
}

function isTokenValid(token: string): boolean {
  const payload = decodeJwtPayload(token)
  if (!payload) return false

  // Must not be expired
  if (payload.exp && payload.exp * 1000 < Date.now()) return false

  // Issuer must be our Neon Auth server
  if (!payload.iss || !payload.iss.includes('neonauth')) return false

  return true
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const authHeader = req.headers.authorization
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (!token || !isTokenValid(token)) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  // Proxy GraphQL request to Hasura with admin secret
  const hasuraRes = await fetch(HASURA_GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-hasura-admin-secret': HASURA_ADMIN_SECRET,
    },
    body: JSON.stringify(req.body),
  })

  const data = await hasuraRes.json()
  return res.status(hasuraRes.status).json(data)
}
