# Archived Files (旧実装)

このディレクトリには、LocalStorageベースの旧実装が保管されています。

## ファイル一覧

### folderManagement.ts.old
- **元の場所**: `lib/folderManagement.ts`
- **説明**: LocalStorageベースのフォルダ・文書管理実装
- **移行日**: 2026-01-28
- **理由**: Prisma + SQLite ベースの新アーキテクチャへ移行

**提供していた機能**:
- フォルダツリー管理 (CRUD)
- 文書管理 (LocalStorage保存)
- 管理番号生成 (階層ベース)
- AI検索用インデックス生成

**新しい実装**:
- Prismaスキーマ: `prisma/schema.prisma` (Document, Folder モデル)
- API: `/api/folders`, `/api/documents`
- 承認フロー: `/api/documents/{approve,reject,submit,withdraw,revise}`

### documentSearch.ts.old
- **元の場所**: `lib/documentSearch.ts`
- **説明**: LocalStorageベースの文書検索実装
- **移行日**: 2026-01-28
- **理由**: API ベースの検索機能へ移行予定

**提供していた機能**:
- キーワード検索 (全文、タイトル、管理番号)
- SearchIndex作成
- AI検索用データ構造

**新しい実装**:
- API: `/api/search` (未実装、将来追加予定)

## 参照していた旧ページ

以下のページは旧実装を使用していますが、非推奨です：

- `/app/dashboard/documents/page.tsx` - LocalStorageベースの文書一覧
- `/app/dashboard/search/page.tsx` - LocalStorageベースの検索
- `/app/dashboard/documents/[id]/page.tsx` - LocalStorageベースの文書詳細

**推奨する新ページ**:
- `/writer/write` - 文書作成
- `/documents` - 文書一覧（Prismaベース）
- `/documents/[id]` - 文書詳細（Prismaベース）
- `/approver` - 承認ダッシュボード

## 型定義の互換性

`components/FolderTree.tsx` との互換性のため、型定義は新しい `lib/folderManagement.ts` に残されています。

実装関数は非推奨エラーをスローするスタブに置き換えられています。

## 復元方法

万が一、旧実装を参照する必要がある場合：

```bash
# ファイルの内容を確認
cat lib\_archived\folderManagement.ts.old

# 一時的に復元（非推奨）
Copy-Item lib\_archived\folderManagement.ts.old lib\folderManagement.ts.backup
```

## 削除予定

以下の条件が満たされたら、このディレクトリを削除できます：

- [ ] `/dashboard/*` ページの完全な移行または削除
- [ ] `FolderTree.tsx` のPrismaベース実装への移行
- [ ] 全文検索API (`/api/search`) の実装完了
