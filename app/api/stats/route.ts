import { NextResponse } from 'next/server'
import sql from '@/lib/db'

export async function GET() {
  const rows = await sql`
    SELECT
      COUNT(*) FILTER (WHERE status = 'approved')::int AS active,
      COUNT(*) FILTER (WHERE status = 'approved' AND type = 'lost')::int AS lost,
      COUNT(*) FILTER (WHERE status = 'approved' AND type = 'found')::int AS found,
      COUNT(*) FILTER (WHERE status = 'claimed')::int AS claimed,
      COUNT(*) FILTER (WHERE status = 'pending')::int AS pending,
      COUNT(*)::int AS total
    FROM items
  `
  return NextResponse.json(rows[0])
}
