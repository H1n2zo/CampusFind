import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import sql from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json()

    if (!username || !password) {
      return NextResponse.json({ error: 'All fields required' }, { status: 400 })
    }
    if (username.length < 3) {
      return NextResponse.json({ error: 'Username must be at least 3 characters' }, { status: 400 })
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    }

    const existing = await sql`SELECT id FROM admins WHERE username = ${username}`
    if (existing.length > 0) {
      return NextResponse.json({ error: 'Username already taken' }, { status: 409 })
    }

    const hash = bcrypt.hashSync(password, 10)
    await sql`INSERT INTO admins (username, password_hash) VALUES (${username}, ${hash})`

    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
