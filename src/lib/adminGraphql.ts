import { authClient } from './neonAuth'

export async function adminGqlRequest<T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  const session = await authClient.getSession()
  const token = session?.data?.session?.token

  const res = await fetch('/api/admin-graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ query, variables }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`HTTP ${res.status}: ${text}`)
  }

  const json = await res.json()
  if (json.errors?.length) throw new Error(json.errors[0].message)
  return json.data as T
}
