import Database from 'better-sqlite3'
import { join } from 'path'
import fs from 'fs'
import bcrypt from 'bcryptjs'

const dataDir = join(process.cwd(), 'data')
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true })
const dbPath = join(dataDir, 'database.sqlite')
const db = new Database(dbPath)

export function run(sql: string, params?: any) {
  const stmt = db.prepare(sql)
  if (params === undefined) return stmt.run()
  if (Array.isArray(params)) return stmt.run(...params)
  return stmt.run(params)
}

export function get(sql: string, params?: any) {
  const stmt = db.prepare(sql)
  if (params === undefined) return stmt.get()
  if (Array.isArray(params)) return stmt.get(...params)
  return stmt.get(params)
}

export function all(sql: string, params?: any) {
  const stmt = db.prepare(sql)
  if (params === undefined) return stmt.all()
  if (Array.isArray(params)) return stmt.all(...params)
  return stmt.all(params)
}

export function createUserSync(email: string, passwordPlain: string, role: 'user' | 'approver' | 'admin' = 'user') {
  const hash = bcrypt.hashSync(passwordPlain, 10)
  const stmt = db.prepare('INSERT INTO users (email, password, role) VALUES (?, ?, ?)')
  return stmt.run(email, hash, role)
}

export function findUserByEmail(email: string) {
  return db.prepare('SELECT * FROM users WHERE email = ?').get(email)
}

export default db
