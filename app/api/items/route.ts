import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { CATEGORIES } from '@/lib/utils'

// GET /api/items?type=lost&category=Electronics&search=phone&status=approved
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const type     = searchParams.get('type')     || ''
  const category = searchParams.get('category') || ''
  const search   = searchParams.get('search')   || ''
  const status   = searchParams.get('status')   || ''
  const admin    = searchParams.get('admin')     || ''

  let rows
  if (admin) {
    // Admin: filter by specific status
    if (status) {
      rows = await sql`
        SELECT i.*, COUNT(c.id)::int AS claim_count
        FROM items i
        LEFT JOIN claim_requests c ON c.item_id = i.id
        WHERE i.status = ${status}
        GROUP BY i.id ORDER BY i.created_at DESC
      `
    } else {
      rows = await sql`
        SELECT i.*, COUNT(c.id)::int AS claim_count
        FROM items i
        LEFT JOIN claim_requests c ON c.item_id = i.id
        GROUP BY i.id ORDER BY i.created_at DESC
      `
    }
  } else {
    // Public board: approved + claimed only
    if (type && category && search) {
      rows = await sql`
        SELECT i.*, COUNT(c.id)::int AS claim_count FROM items i
        LEFT JOIN claim_requests c ON c.item_id = i.id
        WHERE i.status IN ('approved','claimed') AND i.type = ${type}
          AND i.category = ${category}
          AND (i.name ILIKE ${'%'+search+'%'} OR i.description ILIKE ${'%'+search+'%'})
        GROUP BY i.id ORDER BY i.created_at DESC`
    } else if (type && category) {
      rows = await sql`
        SELECT i.*, COUNT(c.id)::int AS claim_count FROM items i
        LEFT JOIN claim_requests c ON c.item_id = i.id
        WHERE i.status IN ('approved','claimed') AND i.type = ${type} AND i.category = ${category}
        GROUP BY i.id ORDER BY i.created_at DESC`
    } else if (type && search) {
      rows = await sql`
        SELECT i.*, COUNT(c.id)::int AS claim_count FROM items i
        LEFT JOIN claim_requests c ON c.item_id = i.id
        WHERE i.status IN ('approved','claimed') AND i.type = ${type}
          AND (i.name ILIKE ${'%'+search+'%'} OR i.description ILIKE ${'%'+search+'%'})
        GROUP BY i.id ORDER BY i.created_at DESC`
    } else if (category && search) {
      rows = await sql`
        SELECT i.*, COUNT(c.id)::int AS claim_count FROM items i
        LEFT JOIN claim_requests c ON c.item_id = i.id
        WHERE i.status IN ('approved','claimed') AND i.category = ${category}
          AND (i.name ILIKE ${'%'+search+'%'} OR i.description ILIKE ${'%'+search+'%'})
        GROUP BY i.id ORDER BY i.created_at DESC`
    } else if (type) {
      rows = await sql`
        SELECT i.*, COUNT(c.id)::int AS claim_count FROM items i
        LEFT JOIN claim_requests c ON c.item_id = i.id
        WHERE i.status IN ('approved','claimed') AND i.type = ${type}
        GROUP BY i.id ORDER BY i.created_at DESC`
    } else if (category) {
      rows = await sql`
        SELECT i.*, COUNT(c.id)::int AS claim_count FROM items i
        LEFT JOIN claim_requests c ON c.item_id = i.id
        WHERE i.status IN ('approved','claimed') AND i.category = ${category}
        GROUP BY i.id ORDER BY i.created_at DESC`
    } else if (search) {
      rows = await sql`
        SELECT i.*, COUNT(c.id)::int AS claim_count FROM items i
        LEFT JOIN claim_requests c ON c.item_id = i.id
        WHERE i.status IN ('approved','claimed')
          AND (i.name ILIKE ${'%'+search+'%'} OR i.description ILIKE ${'%'+search+'%'})
        GROUP BY i.id ORDER BY i.created_at DESC`
    } else {
      rows = await sql`
        SELECT i.*, COUNT(c.id)::int AS claim_count FROM items i
        LEFT JOIN claim_requests c ON c.item_id = i.id
        WHERE i.status IN ('approved','claimed')
        GROUP BY i.id ORDER BY i.created_at DESC`
    }
  }

  return NextResponse.json(rows)
}

// POST /api/items — submit new report
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { type, name, category, location, description, image_path } = body

    if (!type || !name || !category || !location) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    if (!['lost','found'].includes(type)) {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
    if (!CATEGORIES.includes(category)) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 })
    }

    const result = await sql`
      INSERT INTO items (type, name, category, location, description, image_path, status)
      VALUES (${type}, ${name}, ${category}, ${location}, ${description||null}, ${image_path||null}, 'pending')
      RETURNING id
    `
    return NextResponse.json({ success: true, id: result[0].id })
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
