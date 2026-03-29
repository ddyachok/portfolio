import { GraphQLClient } from 'graphql-request'

const HASURA_URL = import.meta.env.VITE_HASURA_GRAPHQL_URL || ''

const gqlClient = new GraphQLClient(HASURA_URL)

export async function gqlRequest<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const headers: Record<string, string> = {}

  const adminSecret = import.meta.env.VITE_HASURA_ADMIN_SECRET
  if (adminSecret) {
    headers['x-hasura-admin-secret'] = adminSecret
  }

  return gqlClient.request<T>(query, variables, headers)
}
