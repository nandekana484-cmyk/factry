import { run, findUserByEmail, createUserSync } from './db'

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
  run(createTableSQL)
  console.log('users テーブルを作成しました (存在しない場合).')

  const adminEmail = 'admin@example.com'
  const existing = findUserByEmail(adminEmail)
  if (!existing) {
    createUserSync(adminEmail, 'password', 'admin')
    console.log(`管理者ユーザーを作成しました: ${adminEmail} / password`)
  } else {
    console.log('管理者ユーザーは既に存在します:', adminEmail)
  }
} catch (err) {
  console.error('DB 初期化中にエラーが発生しました:', err)
  process.exit(1)
}
