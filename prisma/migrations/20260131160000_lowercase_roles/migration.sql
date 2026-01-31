-- 既存ユーザーのrole値を小文字に変換
UPDATE users SET role = LOWER(role);
