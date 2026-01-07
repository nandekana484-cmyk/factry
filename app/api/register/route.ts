import { NextResponse } from 'next/server'
import { findUserByEmail, createUserSync } from '../../../lib/db'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const email = body?.email
    const password = body?.password
    const role = body?.role

    if (!email || !password) {
      return NextResponse.json({ error: 'email and password are required' }, { status: 400 })
    }

    const existing = findUserByEmail(email)
    if (existing) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 })
    }

    const result = createUserSync(email, password, role ?? 'user')
    return NextResponse.json({ ok: true, id: result.lastInsertRowid }, { status: 201 })
  } catch (err) {
    console.error('register error', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
