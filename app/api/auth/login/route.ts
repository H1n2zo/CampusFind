import { NextRequest, NextResponse } from 'next/server'
import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'
import sql from '@/lib/db'
import { sessionOptions, SessionData } from '@/lib/session'

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json()

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password required' }, { status: 400 })
    }

    const rows = await sql`SELECT id, username, password_hash FROM admins WHERE username = ${username} LIMIT 1`
    const admin = rows[0]

    if (!admin || !bcrypt.compareSync(password, admin.password_hash)) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 })
    }

    const session = await getIronSession<SessionData>(await cookies(), sessionOptions)
    session.adminId = admin.id
    session.adminUsername = admin.username
    session.isLoggedIn = true
    await session.save()

    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
