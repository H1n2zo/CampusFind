import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'

// GET /api/claims — all claim requests (admin)
export async function GET() {
  const rows = await sql`
    SELECT c.*, i.name AS item_name, i.type AS item_type
    FROM claim_requests c
    JOIN items i ON i.id = c.item_id
    ORDER BY c.created_at DESC
  `
  return NextResponse.json(rows)
}

// POST /api/claims — submit a claim
export async function POST(req: NextRequest) {
  try {
    const { item_id, claimant_name, message } = await req.json()

    if (!item_id) {
      return NextResponse.json({ error: 'Invalid item' }, { status: 400 })
    }

    const rows = await sql`SELECT id, name FROM items WHERE id = ${item_id} AND status = 'approved'`
    if (!rows.length) {
      return NextResponse.json({ error: 'Item not found or already claimed' }, { status: 404 })
    }

    await sql`
      INSERT INTO claim_requests (item_id, claimant_name, message)
      VALUES (${item_id}, ${claimant_name || null}, ${message || null})
    `

    return NextResponse.json({ success: true, itemName: rows[0].name })
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
