// Local dev API server — mirrors api/admin-graphql.ts for use with npm run dev.
// Started automatically by `npm run dev`; Vite proxies /api/* here.
import { createServer, IncomingMessage, ServerResponse } from 'node:http'

const PORT = 3001

const NEON_AUTH_BASE_URL = process.env.NEON_AUTH_BASE_URL!
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

  if (!token) return json(res, 401, { error: 'Unauthorized' })

  try {
    const authRes = await fetch(`${NEON_AUTH_BASE_URL}/get-session`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!authRes.ok) return json(res, 401, { error: 'Unauthorized' })
    const session = await authRes.json() as { user?: unknown }
    if (!session?.user) return json(res, 401, { error: 'Unauthorized' })

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
