import type { VercelRequest, VercelResponse } from '@vercel/node'

const NEON_AUTH_BASE_URL = process.env.NEON_AUTH_BASE_URL!
const HASURA_GRAPHQL_URL = process.env.HASURA_GRAPHQL_URL!
const HASURA_ADMIN_SECRET = process.env.HASURA_ADMIN_SECRET!

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const authHeader = req.headers.authorization
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized', reason: 'no_token' })
  }

  // Validate session with Neon Auth
  const authRes = await fetch(`${NEON_AUTH_BASE_URL}/get-session`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!authRes.ok) {
    const text = await authRes.text()
    return res.status(401).json({ error: 'Unauthorized', reason: 'auth_failed', status: authRes.status, detail: text })
  }

  const session = await authRes.json()
  if (!session?.user) {
    return res.status(401).json({
      error: 'Unauthorized',
      reason: 'no_user',
      session,
      tokenPrefix: token.slice(0, 8),
      tokenLength: token.length,
    })
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
