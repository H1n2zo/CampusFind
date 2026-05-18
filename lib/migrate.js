// Run this once to set up your Neon database tables:
//   node lib/migrate.js
//
// Make sure DATABASE_URL is set in your environment first.

require('dotenv').config({ path: '.env.local' })
const { neon } = require('@neondatabase/serverless')

const sql = neon(process.env.DATABASE_URL)

async function migrate() {
  console.log('Running migrations...')
  await sql`
    CREATE TABLE IF NOT EXISTS admins (
      id SERIAL PRIMARY KEY,
      username VARCHAR(100) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `
  await sql`
    CREATE TABLE IF NOT EXISTS items (
      id SERIAL PRIMARY KEY,
      type VARCHAR(10) NOT NULL CHECK (type IN ('lost','found')),
      name VARCHAR(255) NOT NULL,
      category VARCHAR(100) NOT NULL,
      location VARCHAR(255) NOT NULL,
      description TEXT,
      image_path VARCHAR(255),
      status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending','approved','rejected','claimed')),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `
  await sql`
    CREATE TABLE IF NOT EXISTS claim_requests (
      id SERIAL PRIMARY KEY,
      item_id INTEGER NOT NULL REFERENCES items(id) ON DELETE CASCADE,
      claimant_name VARCHAR(255),
      message TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `
  console.log('✓ All tables created successfully!')
  process.exit(0)
}

migrate().catch(err => { console.error(err); process.exit(1) })
