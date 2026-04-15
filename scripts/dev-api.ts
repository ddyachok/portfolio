// Local dev API server — mirrors api/admin-graphql.ts for use with npm run dev.
// Started automatically by `npm run dev`; Vite proxies /api/* here.
import { createServer, IncomingMessage, ServerResponse } from 'node:http'

const PORT = 3001

const HASURA_GRAPHQL_URL = process.env.HASURA_GRAPHQL_URL!
const HASURA_ADMIN_SECRET = process.env.HASURA_ADMIN_SECRET!

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk: Buffer) => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    req.on('error', reject)
  })
}

function json(res: ServerResponse, status: number, body: unknown) {
  const payload = JSON.stringify(body)
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  })
  res.end(payload)
}

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
  if (payload.exp && payload.exp * 1000 < Date.now()) return false
  if (!payload.iss || !payload.iss.includes('neonauth')) return false
  return true
}

createServer(async (req, res) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
    })
    return res.end()
  }

  if (req.url !== '/api/admin-graphql' || req.method !== 'POST') {
    return json(res, 404, { error: 'Not found' })
  }

  const token = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.slice(7)
    : null

  if (!token || !isTokenValid(token)) {
    return json(res, 401, { error: 'Unauthorized' })
  }

  try {
    const body = await readBody(req)
    const hasuraRes = await fetch(HASURA_GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-hasura-admin-secret': HASURA_ADMIN_SECRET,
      },
      body,
    })
    const data = await hasuraRes.json()
    return json(res, hasuraRes.status, data)
  } catch (err) {
    console.error('[dev-api]', err)
    return json(res, 500, { error: 'Internal server error' })
  }
}).listen(PORT, () => {
  console.log(`[dev-api] running on http://localhost:${PORT}`)
})
