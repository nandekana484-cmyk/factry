# フォルダベース管理番号システム実装完了レポート

**実装日**: 2026年1月15日  
**目的**: 文書提出時にフォルダ名（フォルダコード）＋連番で管理番号を生成し、Document と Folder を紐づける

---

## ✅ 実装完了項目

### 1. Prisma Schema の拡張 ✅

**変更ファイル**: `prisma/schema.prisma`

#### 追加: Folder モデル
```prisma
model Folder {
  id          Int      @id @default(autoincrement())
  name        String
  code        String   // 管理番号用コード（例: "WI", "MANUAL"）
  parent_id   Int?
  created_at  DateTime @default(now())

  parent      Folder?     @relation("FolderTree", ...)
  children    Folder[]    @relation("FolderTree")
  documents   Document[]

  @@map("folders")
}
```

#### 変更: Document モデル
```prisma
model Document {
  id                Int      @id @default(autoincrement())
  // ... 既存フィールド ...
  folder_id         Int?     // ← 追加
  management_number String?  // コメント更新: "WI-001", "MANUAL-015"

  folder            Folder?  @relation(fields: [folder_id], references: [id])
  // ... その他のリレーション ...
}
```

**マイグレーション**: `20260115120920_add_folder_management`  
**シードデータ**: 3つのフォルダ作成
- 作業指示書 (WI)
- マニュアル (MANUAL)
- 一般文書 (GENERAL)

---

### 2. submit API の修正 ✅

**変更ファイル**: `app/api/documents/submit/route.ts`

#### 変更内容:
- **folderId** を受け取るように変更
- フォルダ情報を取得し、`folder.code` を使用
- フォルダ内の文書数をカウント
- **管理番号を生成**: `${folderCode}-${seq}`（例: WI-001）
- Document に `folder_id` と `management_number` を保存

#### 管理番号生成ロジック:
```typescript
const folder = await tx.folder.findUnique({ where: { id: folderId } });
const folderDocCount = await tx.document.count({
  where: {
    folder_id: folderId,
    management_number: { startsWith: folder.code },
  },
});
const seq = (folderDocCount + 1).toString().padStart(3, "0");
const managementNumber = `${folder.code}-${seq}`;
```

**生成タイミング**: draft → pending（提出時）

---

### 3. approve API の修正 ✅

**変更ファイル**: `app/api/documents/approve/route.ts`

#### 変更内容:
- **管理番号を変更しない**（submit 時に生成済みの値を使用）
- RevisionHistory に既存の `document.management_number` を保存
- 承認時は status を `pending → approved` にのみ変更

#### 修正前:
```typescript
const newManagementNumber = `A-${newRevisionNumber}`;
await tx.document.update({
  data: { status: "approved", management_number: newManagementNumber },
});
```

#### 修正後:
```typescript
// 管理番号は submit 時に生成済みなので変更しない
await tx.document.update({
  data: { status: "approved" },
});

await tx.revisionHistory.create({
  data: {
    management_number: document.management_number || "",
    // ...
  },
});
```

---

### 4. Folder API エンドポイント作成 ✅

**新規ファイル**: `app/api/folders/route.ts`

#### エンドポイント:

##### GET /api/folders
- フォルダ一覧を取得
- 文書数を含む（`_count.documents`）
- 名前順でソート

##### POST /api/folders（管理者のみ）
- 新規フォルダ作成
- `name`, `code`, `parentId` を受け取る
- `code` は自動的に大文字に変換

```typescript
const folders = await prisma.folder.findMany({
  orderBy: { name: "asc" },
  include: { _count: { select: { documents: true } } },
});
```

---

### 5. Writer UI にフォルダ選択機能追加 ✅

**変更ファイル**: `components/AIChat.tsx`

#### 追加機能:
- フォルダ一覧を取得（useEffect）
- フォルダ選択用の `<select>` を追加
- 提出ボタンに `folderId` を渡す

```tsx
<select value={selectedFolderId || ""} onChange={...}>
  <option value="">フォルダなし</option>
  {folders.map((folder) => (
    <option key={folder.id} value={folder.id}>
      {folder.name} ({folder.code})
    </option>
  ))}
</select>
```

**配置**: AIChat コンポーネント内の提出ボタン上部

---

### 6. Writer Actions の修正 ✅

**変更ファイル**: `app/writer/write/hooks/useWriterActions.ts`

#### 変更内容:
- `handleSubmitDocument` に `folderId` パラメータを追加
- Prisma API を呼び出すように変更:
  1. `/api/documents` で文書作成
  2. `/api/documents/submit` で承認申請（folderId を含む）
- 管理番号が生成された場合はアラートで表示

```typescript
const handleSubmitDocument = useCallback(async (folderId?: number) => {
  // 1. 文書作成
  const createResponse = await fetch("/api/documents", { ... });
  
  // 2. 承認申請（管理番号生成）
  const submitResponse = await fetch("/api/documents/submit", {
    body: JSON.stringify({ documentId, folderId, comment }),
  });
  
  // 3. 成功メッセージ
  const message = result.managementNumber
    ? `ドキュメントを提出しました\n管理番号: ${result.managementNumber}`
    : `ドキュメントを提出しました`;
  alert(message);
}, []);
```

---

### 7. 型定義の更新 ✅

**変更ファイル**: `types/document.ts`

#### 追加: Folder インターフェース
```typescript
export interface Folder {
  id: number;
  name: string;
  code: string;
  parent_id?: number | null;
  created_at?: string;
  _count?: {
    documents: number;
  };
}
```

---

### 8. folderManagement.ts の対応 ✅

**変更ファイル**: `lib/folderManagement.ts`

#### 対応内容:
- **削除せずに保持**（/dashboard/documents などで使用中）
- ファイル冒頭に警告コメントを追加:
  - LocalStorage ベースのレガシー実装であることを明記
  - 新規機能は Prisma ベースを使用するよう案内

```typescript
/**
 c
 */
```

---

## 📊 システムアーキテクチャ

### 管理番号生成フロー

```
1. Writer Page
   ↓ フォルダ選択 (WI, MANUAL, GENERAL)
   
2. 提出ボタン押下
   ↓ POST /api/documents (文書作成)
   ↓ POST /api/documents/submit (folderId 付き)
   
3. submit API
   ↓ Folder 情報取得 (code: "WI")
   ↓ フォルダ内の文書数カウント
   ↓ 管理番号生成: "WI-001"
   ↓ Document に保存 (folder_id, management_number)
   
4. 承認待ち状態 (pending)
   ↓
   
5. approve API（承認者が実行）
   ↓ 管理番号は変更しない（submit 時の値を維持）
   ↓ RevisionHistory に記録
   
6. 承認済み状態 (approved)
   管理番号: WI-001
```

### データベース構造

```
folders
  ├─ id: 1, name: "作業指示書", code: "WI"
  ├─ id: 2, name: "マニュアル", code: "MANUAL"
  └─ id: 3, name: "一般文書", code: "GENERAL"

documents
  ├─ id: 1, title: "...", folder_id: 1, management_number: "WI-001"
  ├─ id: 2, title: "...", folder_id: 1, management_number: "WI-002"
  └─ id: 3, title: "...", folder_id: 2, management_number: "MANUAL-001"
```

---

## 🎯 達成された仕様

### ✅ フォルダと管理番号の紐付け
- Document.folder_id で Folder と紐付け
- 管理番号は「フォルダコード + 連番」形式

### ✅ 管理番号生成タイミング
- **提出時**（draft → pending）に生成
- 承認時は変更しない

### ✅ フォルダベースの連番
- フォルダ単位でカウント
- 例: WI-001, WI-002, MANUAL-001, MANUAL-002

### ✅ UI での選択機能
- AIChat コンポーネント内にフォルダ選択 UI
- フォルダ一覧を API から取得

---

## 🔧 実装の詳細

### 使用技術
- **DB**: SQLite + Prisma ORM
- **API**: Next.js App Router (Route Handlers)
- **UI**: React + TailwindCSS
- **認証**: Cookie ベース

### 主要ファイル

| ファイル | 役割 |
|---------|------|
| `prisma/schema.prisma` | Folder, Document モデル定義 |
| `app/api/folders/route.ts` | フォルダ一覧取得・作成 API |
| `app/api/documents/submit/route.ts` | 文書提出・管理番号生成 API |
| `app/api/documents/approve/route.ts` | 文書承認 API（管理番号変更なし） |
| `components/AIChat.tsx` | フォルダ選択 UI |
| `app/writer/write/hooks/useWriterActions.ts` | 提出処理ロジック |
| `types/document.ts` | Folder 型定義 |
| `lib/folderManagement.ts` | レガシー実装（保持、警告付き） |

---

## 🧪 テスト観点

### 管理番号生成テスト
1. フォルダ「WI」を選択して提出 → `WI-001` 生成
2. 同じフォルダに2件目提出 → `WI-002` 生成
3. 別フォルダ「MANUAL」に提出 → `MANUAL-001` 生成
4. フォルダ未選択で提出 → 管理番号 `null`

### 承認フローテスト
1. 提出時に管理番号生成 → `WI-001`
2. 承認時に管理番号変更なし → `WI-001` のまま
3. RevisionHistory に管理番号記録 → `WI-001`

### API テスト
- GET /api/folders → フォルダ一覧取得
- POST /api/folders → 新規フォルダ作成（管理者のみ）
- POST /api/documents/submit → 管理番号生成

---

## 📝 今後の拡張案

### 優先度: 高
1. フォルダ階層管理（parent_id を活用）
2. 文書一覧でのフォルダフィルター機能
3. 管理番号の形式カスタマイズ（設定画面）

### 優先度: 中
4. フォルダ削除・編集機能
5. フォルダ移動・並び替え
6. 管理番号の重複チェック強化

### 優先度: 低
7. LocalStorage 実装の完全移行・削除
8. フォルダ統計情報（文書数、承認率など）

---

## ✅ 結論

フォルダベースの管理番号生成システムが**完全に実装**されました。

**達成内容**:
- ✅ Prisma Schema に Folder モデル追加
- ✅ Document に folder_id 追加
- ✅ submit API で管理番号生成（フォルダコード + 連番）
- ✅ approve API は管理番号を変更しない
- ✅ UI でフォルダ選択可能
- ✅ 既存コードとの整合性維持（folderManagement.ts は警告付きで保持）

**管理番号の例**:
- `WI-001`, `WI-002`, `WI-003` ...（作業指示書フォルダ）
- `MANUAL-001`, `MANUAL-002` ...（マニュアルフォルダ）
- `GENERAL-001`, `GENERAL-002` ...（一般文書フォルダ）

**生成タイミング**: 提出時（draft → pending）  
**変更なし**: 承認時（pending → approved）

これにより、フォルダと管理番号の正しい紐付けが実現されました。
