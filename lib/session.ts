import { SessionOptions } from 'iron-session'

export interface SessionData {
  adminId?: number
  adminUsername?: string
  isLoggedIn?: boolean
}

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET!,
  cookieName: 'campusfind_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
  },
}
