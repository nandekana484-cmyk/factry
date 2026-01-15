import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const email = body?.email
    const password = body?.password
    const role = body?.role

    if (!email || !password) {
      return NextResponse.json({ error: 'email and password are required' }, { status: 400 })
    }

    // Prismaで既存ユーザーをチェック
    const existing = await prisma.user.findUnique({
      where: { email },
    })

    if (existing) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 })
    }

    // パスワードをハッシュ化
    const hashedPassword = await bcrypt.hash(password, 10)

    // Prismaでユーザーを作成
    const user = await prisma.user.create({
      data: {
        name: email.split('@')[0], // emailのローカル部分を名前として使用
        email,
        password: hashedPassword,
        role: role ?? 'user',
      },
    })

    return NextResponse.json({ ok: true, id: user.id }, { status: 201 })
  } catch (err) {
    console.error('register error', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
