"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("./db");
const createTableSQL = `
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('user','approver','admin')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`;
try {
    (0, db_1.run)(createTableSQL);
    console.log('users テーブルを作成しました (存在しない場合).');
    const adminEmail = 'admin@example.com';
    const existing = (0, db_1.findUserByEmail)(adminEmail);
    if (!existing) {
        (0, db_1.createUserSync)(adminEmail, 'password', 'admin');
        console.log(`管理者ユーザーを作成しました: ${adminEmail} / password`);
    }
    else {
        console.log('管理者ユーザーは既に存在します:', adminEmail);
    }
}
catch (err) {
    console.error('DB 初期化中にエラーが発生しました:', err);
    process.exit(1);
}
