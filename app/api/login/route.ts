import { NextResponse } from 'next/server'
import { findUserByEmail } from '../../../lib/db'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const email = body?.email
    const password = body?.password

    if (!email || !password) {
      return NextResponse.json({ error: 'email and password are required' }, { status: 400 })
    }

    const user = findUserByEmail(email)
    if (!user) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })

    const ok = bcrypt.compareSync(password, user.password)
    if (!ok) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })

    const { password: _p, ...safe } = user
    return NextResponse.json({ ok: true, user: safe }, { status: 200 })
  } catch (err) {
    console.error('login error', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
