import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)
export default sql

// Run once to create tables: node lib/migrate.js
export async function runMigrations() {
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
  console.log('✓ Migrations complete')
}
