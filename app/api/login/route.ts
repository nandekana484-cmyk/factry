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

    // Cookie にログイン状態を保存（簡易版）
    const res = NextResponse.json({ ok: true }, { status: 200 })
    res.cookies.set({
      name: "token",
      value: "devtoken", // フェーズ1は固定値でOK
      httpOnly: true,
      path: "/",
    })

    return res
  } catch (err) {
    console.error('login error', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}