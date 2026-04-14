import { GraphQLClient } from 'graphql-request'

const HASURA_URL = import.meta.env.VITE_HASURA_GRAPHQL_URL || ''

const gqlClient = new GraphQLClient(HASURA_URL)

export async function gqlRequest<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  return gqlClient.request<T>(query, variables)
}
