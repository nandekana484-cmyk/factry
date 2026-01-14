# 承認フローAPI仕様

## 概要
文書（documents）に対する承認フローを実装しました。

## 状態遷移
- **draft** → **pending** （提出）
- **pending** → **approved** （承認）
- **pending** → **draft** （差し戻し・引き戻し）
- **approved** → **draft** （改定開始）

## データモデル

### Document
- id, title, status (draft/pending/approved), creator_id, created_at, updated_at

### DocumentBlock
- 文書のコンテンツブロック（JSON形式で保存）

### ApprovalRequest
- pending状態の文書にのみ存在
- document_id, requester_id, requested_at, comment

### ApprovalHistory
- すべての承認アクション履歴
- action: submitted, approved, rejected, withdrawn, revised

## API エンドポイント

### 作成者側API

#### 1. 下書き保存
```
POST /api/documents/save-draft
{
  "documentId": number | null,  // null = 新規作成
  "title": string,
  "blocks": Array<Block>,
  "creatorId": number
}
```

#### 2. 承認申請（draft → pending）
```
POST /api/documents/submit
{
  "documentId": number,
  "userId": number,
  "comment": string?
}
```

#### 3. 引き戻し（pending → draft）
```
POST /api/documents/withdraw
{
  "documentId": number,
  "userId": number,
  "comment": string?
}
```

#### 4. 改定開始（approved → draft）
```
POST /api/documents/revise
{
  "documentId": number,
  "userId": number,
  "comment": string?
}
```

### 承認者側API

#### 5. 承認（pending → approved）
```
POST /api/documents/approve
{
  "documentId": number,
  "userId": number,
  "comment": string?
}
```

#### 6. 差し戻し（pending → draft）
```
POST /api/documents/reject
{
  "documentId": number,
  "userId": number,
  "comment": string?
}
```

### 共通API

#### 7. 文書取得
```
GET /api/documents/{id}
```
返却：文書詳細、ブロック、承認リクエスト情報

#### 8. 文書一覧取得
```
GET /api/documents?status={status}&creatorId={creatorId}
```
返却：フィルタリングされた文書一覧

#### 9. 承認履歴取得
```
GET /api/documents/{id}/history
```
返却：文書に関するすべての承認アクション履歴

## 使用例

### 1. 新規文書を作成して提出
```javascript
// 1. 下書き保存
const res1 = await fetch('/api/documents/save-draft', {
  method: 'POST',
  body: JSON.stringify({
    title: '新規文書',
    blocks: [...],
    creatorId: 1
  })
});
const { documentId } = await res1.json();

// 2. 承認申請
await fetch('/api/documents/submit', {
  method: 'POST',
  body: JSON.stringify({
    documentId,
    userId: 1,
    comment: '承認をお願いします'
  })
});
```

### 2. 承認者が承認
```javascript
await fetch('/api/documents/approve', {
  method: 'POST',
  body: JSON.stringify({
    documentId: 1,
    userId: 2,  // 承認者ID
    comment: '承認しました'
  })
});
```

### 3. 承認済み文書を改定
```javascript
// 改定開始（approved → draft）
await fetch('/api/documents/revise', {
  method: 'POST',
  body: JSON.stringify({
    documentId: 1,
    userId: 1,  // 作成者ID
    comment: '内容を更新します'
  })
});

// 内容を編集して保存
await fetch('/api/documents/save-draft', {
  method: 'POST',
  body: JSON.stringify({
    documentId: 1,
    title: '更新後のタイトル',
    blocks: [...],
    creatorId: 1
  })
});
```

## データベースセットアップ

```bash
# Prisma Clientを生成
npx prisma generate

# データベースをスキーマと同期
npx prisma db push

# テストデータを作成（オプション）
npx tsx prisma/seed.ts
```

## テストデータ

シードスクリプトで以下のテストデータが作成されます：

### ユーザー
- **writer@example.com** (password: password) - role: user
- **approver@example.com** (password: password) - role: approver

### 文書
1. 下書き文書のサンプル (draft)
2. 承認待ち文書のサンプル (pending)
3. 承認済み文書のサンプル (approved)

## UI実装

### 文書一覧ページ (/documents)
- すべての文書を一覧表示
- 状態（draft/pending/approved）でフィルタリング可能
- 文書カードをクリックして詳細ページへ遷移

### 文書詳細ページ (/documents/[id])
- 文書のタイトル、作成者、状態を表示
- ブロック内容（text/image/shape）を表示
- 承認リクエスト情報を表示（pending時）
- ユーザーの権限と文書の状態に応じたアクションボタン

**作成者用ボタン:**
- draft状態 → 「提出」ボタン
- pending状態 → 「引き戻し」ボタン
- approved状態 → 「改定開始」ボタン

**承認者用ボタン:**
- pending状態 → 「承認」「差し戻し」ボタン

### 承認履歴ページ (/documents/[id]/history)
- すべての承認アクション履歴をタイムライン形式で表示
- action: submitted/approved/rejected/withdrawn/revised
- ユーザー名、コメント、日時を表示

### アクセス
1. ログイン後、ダッシュボードから「承認フロー」をクリック
2. または直接 `/documents` にアクセス

## 注意事項

1. **テンプレートは承認対象外**
   - templatesテーブルは承認フローに含まれません

2. **pending状態の文書**
   - ApprovalRequestレコードが存在します
   - draft/approvedに戻ると自動削除されます

3. **履歴の記録**
   - すべての状態遷移はApprovalHistoryに記録されます
   - action: submitted, approved, rejected, withdrawn, revised

4. **権限チェック**
   - withdraw/revise: 作成者のみ実行可能
   - approve/reject: 承認者（role=approver）が実行すべき

5. **トランザクション処理**
   - 状態変更、承認リクエスト操作、履歴記録は
     すべてトランザクション内で実行されます
