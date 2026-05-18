import { NextRequest, NextResponse } from 'next/server'
import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { v2 as cloudinary } from 'cloudinary'
import sql from '@/lib/db'
import { sessionOptions, SessionData } from '@/lib/session'

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// GET /api/items/[id]
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const id = parseInt(params.id)
  const rows = await sql`SELECT * FROM items WHERE id = ${id}`
  if (!rows.length) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const item = rows[0]
  const claims = await sql`SELECT * FROM claim_requests WHERE item_id = ${id} ORDER BY created_at DESC`
  return NextResponse.json({ ...item, claims })
}

// PATCH /api/items/[id] — approve, reject, claimed (admin only)
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions)
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const id = parseInt(params.id)
  const { action } = await req.json()

  const rows = await sql`SELECT * FROM items WHERE id = ${id}`
  if (!rows.length) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const item = rows[0]

  if (action === 'approve') {
    if (item.status !== 'pending') {
      return NextResponse.json({ error: 'Item is not pending' }, { status: 400 })
    }
    await sql`UPDATE items SET status = 'approved', updated_at = NOW() WHERE id = ${id}`
    return NextResponse.json({ success: true, msg: '✓ Post approved and published!' })
  }

  if (action === 'reject') {
    // Delete image from Cloudinary if exists
    if (item.image_path) {
      try {
        // Extract public_id from cloudinary URL
        const parts = item.image_path.split('/')
        const filename = parts[parts.length - 1].split('.')[0]
        const folder = parts[parts.length - 2]
        await cloudinary.uploader.destroy(`${folder}/${filename}`)
      } catch {}
    }
    await sql`DELETE FROM items WHERE id = ${id}`
    return NextResponse.json({ success: true, msg: 'Post rejected and removed.' })
  }

  if (action === 'claimed') {
    await sql`UPDATE items SET status = 'claimed', updated_at = NOW() WHERE id = ${id}`
    return NextResponse.json({ success: true, msg: `★ "${item.name}" marked as claimed!` })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
