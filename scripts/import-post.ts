/**
 * Import a markdown blog post into the Neon database via Hasura GraphQL.
 *
 * Usage:
 *   npx tsx scripts/import-post.ts path/to/post.md
 *
 * The markdown file should have YAML frontmatter:
 *   ---
 *   title: "Post Title"
 *   slug: my-post-slug
 *   excerpt: "Short description..."
 *   tags: [Tag1, Tag2]
 *   cover_image_url: https://...  (optional)
 *   reading_time_minutes: 12
 *   ---
 *   ...markdown content...
 */

import { readFileSync } from 'fs'
import { resolve } from 'path'

const HASURA_URL = process.env.HASURA_GRAPHQL_URL || ''
const HASURA_ADMIN_SECRET = process.env.HASURA_ADMIN_SECRET || ''

const INSERT_POST = `
  mutation InsertBlogPost($object: blog_posts_insert_input!) {
    insert_blog_posts_one(
      object: $object
      on_conflict: {
        constraint: blog_posts_slug_key
        update_columns: [title, excerpt, content, cover_image_url, tags, reading_time_minutes, updated_at]
      }
    ) {
      id
      slug
      title
    }
  }
`

interface Frontmatter {
  title: string
  slug: string
  excerpt?: string
  tags?: string[]
  cover_image_url?: string
  reading_time_minutes?: number
}

function parseFrontmatter(raw: string): { frontmatter: Frontmatter; content: string } {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
  if (!match) {
    throw new Error('No frontmatter found. File must start with ---')
  }

  const [, yamlBlock, content] = match
  const frontmatter: Record<string, unknown> = {}

  for (const line of yamlBlock.split('\n')) {
    const colonIdx = line.indexOf(':')
    if (colonIdx === -1) continue

    const key = line.slice(0, colonIdx).trim()
    let value: unknown = line.slice(colonIdx + 1).trim()

    // Parse arrays: [Tag1, Tag2]
    if (typeof value === 'string' && value.startsWith('[') && value.endsWith(']')) {
      value = value.slice(1, -1).split(',').map((s) => s.trim().replace(/^["']|["']$/g, ''))
    }
    // Parse numbers
    else if (typeof value === 'string' && /^\d+$/.test(value)) {
      value = parseInt(value, 10)
    }
    // Strip quotes
    else if (typeof value === 'string') {
      value = value.replace(/^["']|["']$/g, '')
    }

    frontmatter[key] = value
  }

  return { frontmatter: frontmatter as unknown as Frontmatter, content: content.trim() }
}

async function importPost(filePath: string) {
  if (!HASURA_URL) {
    console.error('Error: HASURA_GRAPHQL_URL environment variable is not set')
    console.error('Set it in your shell or create a .env file')
    process.exit(1)
  }

  const absolutePath = resolve(filePath)
  console.log(`Reading: ${absolutePath}`)

  const raw = readFileSync(absolutePath, 'utf-8')
  const { frontmatter, content } = parseFrontmatter(raw)

  console.log(`Title: ${frontmatter.title}`)
  console.log(`Slug: ${frontmatter.slug}`)
  console.log(`Tags: ${frontmatter.tags?.join(', ') || 'none'}`)

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (HASURA_ADMIN_SECRET) {
    headers['x-hasura-admin-secret'] = HASURA_ADMIN_SECRET
  }

  const response = await fetch(HASURA_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      query: INSERT_POST,
      variables: {
        object: {
          title: frontmatter.title,
          slug: frontmatter.slug,
          excerpt: frontmatter.excerpt || '',
          content,
          cover_image_url: frontmatter.cover_image_url || null,
          tags: `{${(frontmatter.tags || []).join(',')}}`,
          reading_time_minutes: frontmatter.reading_time_minutes || 0,
          published: true,
          published_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      },
    }),
  })

  const result = await response.json()

  if (result.errors) {
    console.error('GraphQL errors:', JSON.stringify(result.errors, null, 2))
    process.exit(1)
  }

  const post = result.data.insert_blog_posts_one
  console.log(`\nImported successfully!`)
  console.log(`  ID: ${post.id}`)
  console.log(`  URL: /blog/${post.slug}`)
}

// CLI
const filePath = process.argv[2]
if (!filePath) {
  console.error('Usage: npx tsx scripts/import-post.ts <path-to-markdown-file>')
  process.exit(1)
}

importPost(filePath)
