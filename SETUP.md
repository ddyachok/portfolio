# Backend Setup Guide

## 1. Create Neon Database

1. Go to [neon.tech](https://neon.tech) and create a new project
2. Copy the connection string from the dashboard
3. Run this SQL in the Neon SQL Editor:

```sql
CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  cover_image_url TEXT,
  tags TEXT[] DEFAULT '{}',
  reading_time_minutes INTEGER DEFAULT 0,
  published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_blog_posts_published ON blog_posts(published);
```

## 2. Set Up Hasura Cloud

1. Go to [cloud.hasura.io](https://cloud.hasura.io) and create a new project (free tier)
2. In the Hasura Console, go to **Data** → **Connect Database**
3. Choose **Neon** and paste your connection string
4. Go to **Data** → **Track** the `blog_posts` table
5. Go to **Settings** → copy your **Admin Secret**
6. Set up permissions:
   - Role: `anonymous`
   - Table: `blog_posts`
   - Select: Allow with filter `{"published": {"_eq": true}}`
   - Columns: all except `content` for list queries (or all)

## 3. Configure Environment

Copy `.env.example` to `.env` and fill in:

```bash
cp .env.example .env
```

Set:
- `VITE_HASURA_GRAPHQL_URL` — your Hasura GraphQL endpoint
- `HASURA_GRAPHQL_URL` — same URL (for import script)
- `HASURA_ADMIN_SECRET` — your admin secret (for import script)

## 4. Import First Blog Post

Add frontmatter to your blog post markdown file, then run:

```bash
HASURA_GRAPHQL_URL=https://your-project.hasura.app/v1/graphql \
HASURA_ADMIN_SECRET=your-secret \
npx tsx scripts/import-post.ts /path/to/blog/dynamic-localization-in-ios.md
```

## 5. Deploy to Vercel

```bash
npm install -g vercel
vercel
```

Set environment variables in Vercel dashboard:
- `VITE_HASURA_GRAPHQL_URL`
