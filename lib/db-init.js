const Database = require('better-sqlite3')
const { join } = require('path')
const fs = require('fs')
const bcrypt = require('bcryptjs')

const dataDir = join(process.cwd(), 'data')
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true })
const dbPath = join(dataDir, 'database.sqlite')
const db = new Database(dbPath)

const createTableSQL = `
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('user','approver','admin')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`

try {
  db.prepare(createTableSQL).run()
  console.log('users テーブルを作成しました (存在しない場合).')

  const adminEmail = 'admin@example.com'
  const existing = db.prepare('SELECT * FROM users WHERE email = ?').get(adminEmail)
  if (!existing) {
    const hash = bcrypt.hashSync('password', 10)
    db.prepare('INSERT INTO users (email, password, role) VALUES (?, ?, ?)').run(adminEmail, hash, 'admin')
    console.log(`管理者ユーザーを作成しました: ${adminEmail} / password`)
  } else {
    console.log('管理者ユーザーは既に存在します:', adminEmail)
  }
} catch (err) {
  console.error('DB 初期化中にエラーが発生しました:', err)
  process.exit(1)
}

module.exports = {}
