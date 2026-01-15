# 管理番号生成ロジック調査報告書

**調査日**: 2026年1月15日  
**対象**: 文書提出時の管理番号生成ロジックとフォルダ連携

---

## 📊 調査結果サマリー

### ❌ **重大な問題: フォルダ管理機能が実装されていない**

現在のシステムには**2つの異なる実装**が混在しており、フォルダベースの管理番号生成は**動作していません**。

| 項目 | 期待される実装 | 実際の実装 | 状態 |
|------|--------------|------------|------|
| フォルダ管理 | Prisma + DB | localStorage (未使用) | ❌ 未実装 |
| 管理番号生成 | フォルダ名 + 連番 | A-1, A-2... (単純連番) | ❌ 不一致 |
| 生成タイミング | 提出時 | **承認時** | ❌ 不一致 |
| フォルダ紐付け | Document.folderId | **フィールドなし** | ❌ 未実装 |

---

## 🔍 詳細分析

### 1. Prisma Schema の確認

**現在の Document モデル**:
```prisma
model Document {
  id                Int      @id @default(autoincrement())
  title             String
  status            String   @default("draft")
  creator_id        Int
  template_id       Int?
  management_number String?  // 管理番号（例: "A-1", "A-2"）
  created_at        DateTime @default(now())
  updated_at        DateTime @updatedAt
  
  // リレーション
  creator           User              @relation("DocumentCreator", fields: [creator_id], references: [id])
  blocks            DocumentBlock[]
  approvalRequest   ApprovalRequest?
  approvalHistories ApprovalHistory[]
  revisionHistories RevisionHistory[]
}
```

**問題点**:
- ✅ `management_number` フィールドは存在
- ❌ `folder_id` フィールドが**存在しない**
- ❌ `Folder` モデルが**存在しない**

---

### 2. 管理番号の生成場所

#### **実際の実装: approve API で生成**

**ファイル**: `app/api/documents/approve/route.ts` (Line 39-41)

```typescript
// 管理番号を生成または更新（A-1, A-2, A-3...）
// 承認済みの改定のみをカウント（クエリでフィルタ済み）
const approvedRevisions = document.revisionHistories;
const newRevisionNumber = approvedRevisions.length + 1;
const newManagementNumber = `A-${newRevisionNumber}`;
```

**生成タイミング**: 承認時（pending → approved）  
**生成ルール**: `A-{承認済み文書数 + 1}`  
**フォルダとの関係**: **なし**（全文書で単一のカウンター）

#### **submit API の確認**

**ファイル**: `app/api/documents/submit/route.ts`

```typescript
// 承認申請（draft → pending）
export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    const { documentId, comment } = await req.json();
    
    // ...状態チェック...
    
    // 文書の状態を pending に更新
    await tx.document.update({
      where: { id: documentId },
      data: { status: "pending" },
    });
    
    // 承認リクエストを作成
    await tx.approvalRequest.create({
      data: {
        document_id: documentId,
        requester_id: user.id,
        comment: comment || null,
      },
    });
  }
}
```

**確認結果**: submit API では**管理番号を生成していない**

---

### 3. フォルダ管理ロジックの状態

#### **lib/folderManagement.ts の実装**

このファイルには**理想的な実装**が含まれていますが、**実際には使用されていません**：

```typescript
// フォルダベースの管理番号生成（未使用）
export function generateManagementNumber(folderPath: string[]): string {
  const documents = getDocuments();
  const baseNumber = folderPath.join("");
  
  // 同じベース番号を持つ文書の最大連番を取得
  const sameBaseDocuments = documents.filter((doc) =>
    doc.managementNumber.startsWith(baseNumber)
  );
  
  let maxSeq = 0;
  sameBaseDocuments.forEach((doc) => {
    const seqPart = doc.managementNumber.substring(baseNumber.length);
    const seq = parseInt(seqPart, 10);
    if (!isNaN(seq) && seq > maxSeq) {
      maxSeq = seq;
    }
  });

  const newSeq = (maxSeq + 1).toString().padStart(3, "0");
  return `${baseNumber}${newSeq}`;
}

// 文書提出（未使用）
export function submitDocument(
  title: string,
  folderId: string,
  folderPath: string[],
  templateId: string,
  blocks: any[],
  creator: string
): Document {
  const managementNumber = generateManagementNumber(folderPath);
  // ...
}
```

**問題点**:
- ✅ フォルダパスから管理番号を生成するロジックが存在
- ✅ フォルダ単位で連番をカウントするロジックが存在
- ❌ **localStorage ベース**（Prisma と連携していない）
- ❌ **実際のAPIで使用されていない**

---

### 4. UI での表示

#### **app/dashboard/documents/[id]/page.tsx**

```tsx
<div>
  <label className="block text-sm font-semibold text-gray-600 mb-1">
    管理番号
  </label>
  <p className="text-lg font-mono">{document.managementNumber}</p>
</div>
```

**表示内容**: `A-1`, `A-2`, `A-3`...（承認順の連番）

---

## 🚨 問題点の整理

### **問題1: フォルダ管理機能が未実装**

- Prisma スキーマに `Folder` モデルが存在しない
- `Document` モデルに `folder_id` フィールドが存在しない
- フォルダとの紐付けが**データベースレベルで不可能**

### **問題2: 管理番号生成ロジックが仕様と不一致**

**期待される仕様**:
- フォルダ名 + 連番（例: `WI-001`, `MANUAL-015`）
- フォルダ単位でカウント
- 提出時に生成

**実際の実装**:
- 単純な連番（`A-1`, `A-2`...）
- 全文書で単一のカウンター
- **承認時に生成**

### **問題3: 2つの実装が混在**

1. **Prisma ベース実装**（実際に動作）:
   - データベース: SQLite
   - 管理番号: A-1, A-2...
   - フォルダ: なし

2. **localStorage ベース実装**（未使用）:
   - ストレージ: localStorage
   - 管理番号: フォルダパス + 連番
   - フォルダ: あり

**結果**: コードの混乱と機能の不一致

---

## 💡 修正案

### **方針1: フォルダ管理機能を完全実装（推奨）**

#### **Step 1: Prisma Schema の拡張**

```prisma
model Folder {
  id          Int      @id @default(autoincrement())
  name        String
  code        String   // フォルダコード（例: "WI", "MANUAL"）
  parent_id   Int?
  created_at  DateTime @default(now())
  
  parent      Folder?     @relation("FolderTree", fields: [parent_id], references: [id])
  children    Folder[]    @relation("FolderTree")
  documents   Document[]
  
  @@map("folders")
}

model Document {
  id                Int      @id @default(autoincrement())
  title             String
  status            String   @default("draft")
  creator_id        Int
  template_id       Int?
  folder_id         Int?     // ← 追加
  management_number String?
  created_at        DateTime @default(now())
  updated_at        DateTime @updatedAt
  
  creator           User              @relation("DocumentCreator", fields: [creator_id], references: [id])
  folder            Folder?           @relation(fields: [folder_id], references: [id]) // ← 追加
  blocks            DocumentBlock[]
  approvalRequest   ApprovalRequest?
  approvalHistories ApprovalHistory[]
  revisionHistories RevisionHistory[]
  
  @@map("documents")
}
```

#### **Step 2: submit API の修正**

```typescript
// app/api/documents/submit/route.ts
export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    const { documentId, folderId, comment } = await req.json(); // folderIdを追加
    
    const result = await prisma.$transaction(async (tx) => {
      // フォルダ情報を取得
      let folderCode = "GENERAL"; // デフォルト
      if (folderId) {
        const folder = await tx.folder.findUnique({
          where: { id: folderId },
        });
        if (folder) {
          folderCode = folder.code;
        }
      }
      
      // フォルダ内の文書数をカウント
      const folderDocCount = await tx.document.count({
        where: {
          folder_id: folderId,
          management_number: { startsWith: folderCode },
        },
      });
      
      // 管理番号を生成
      const seq = (folderDocCount + 1).toString().padStart(3, "0");
      const managementNumber = `${folderCode}-${seq}`;
      
      // 文書を更新
      await tx.document.update({
        where: { id: documentId },
        data: {
          status: "pending",
          folder_id: folderId,
          management_number: managementNumber,
        },
      });
      
      // 承認リクエストを作成
      await tx.approvalRequest.create({
        data: {
          document_id: documentId,
          requester_id: user.id,
          comment: comment || null,
        },
      });
      
      // 履歴を記録
      await tx.approvalHistory.create({
        data: {
          document_id: documentId,
          user_id: user.id,
          action: "submitted",
          comment: comment || null,
        },
      });
      
      return { status: "pending", managementNumber };
    });
    
    return NextResponse.json({ ok: true, ...result });
  } catch (error: any) {
    // ...エラーハンドリング...
  }
}
```

#### **Step 3: approve API の修正**

```typescript
// app/api/documents/approve/route.ts
export async function POST(req: Request) {
  // ...
  
  // 管理番号は既に submit 時に生成されているので、
  // RevisionHistory への記録のみ行う
  
  await tx.revisionHistory.create({
    data: {
      document_id: documentId,
      management_number: document.management_number, // 既存の番号を使用
      revision_symbol: revisionSymbol,
      title: document.title,
      approved_by_id: user.id,
      created_by_id: document.creator_id,
      approved_at: new Date(),
    },
  });
  
  // ...
}
```

---

### **方針2: 現在の実装を維持（簡易版）**

フォルダ機能を実装せず、現在の `A-1`, `A-2`... 形式を継続する場合：

#### **Step 1: 管理番号を submit 時に生成**

```typescript
// app/api/documents/submit/route.ts
const result = await prisma.$transaction(async (tx) => {
  // 承認済み文書数をカウント
  const approvedCount = await tx.document.count({
    where: { status: "approved" },
  });
  
  // 管理番号を生成（仮番号）
  const tempManagementNumber = `TEMP-${Date.now()}`;
  
  // 文書を更新
  await tx.document.update({
    where: { id: documentId },
    data: {
      status: "pending",
      management_number: tempManagementNumber, // 仮番号
    },
  });
  
  // ...
});
```

#### **Step 2: approve API で正式番号に更新**

現在の実装を維持（A-1, A-2...）

---

## 📋 推奨事項

### **優先度: 高**

1. ✅ **フォルダ管理機能を完全実装**（方針1）
   - Prisma Schema に Folder モデル追加
   - Document に folder_id 追加
   - submit API で管理番号生成

2. ✅ **lib/folderManagement.ts を削除または移行**
   - 現在は混乱の原因
   - Prisma ベースに統一

### **優先度: 中**

3. ✅ **UI の整合性確認**
   - フォルダ選択UIの追加
   - 管理番号の表示形式統一

### **優先度: 低**

4. ✅ **既存データの移行**
   - A-1, A-2... → フォルダベース番号への変換

---

## 🎯 結論

**現在の状態**: 
- ❌ フォルダと管理番号の紐付けは**実装されていない**
- ❌ 管理番号は**承認時**に生成（提出時ではない）
- ❌ 管理番号は**単純連番**（フォルダベースではない）
- ❌ 2つの実装が混在し、コードが混乱している

**推奨アクション**:
1. **フォルダ管理機能を Prisma で実装**
2. **submit API で管理番号を生成**
3. **lib/folderManagement.ts を削除**
4. **UI でフォルダ選択を実装**

これにより、`WI-001`, `MANUAL-015` のようなフォルダベースの管理番号が実現できます。
