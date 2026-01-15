# プロジェクトレビュー報告書

**日付**: 2026年1月15日  
**対象**: 承認フロー・改定フロー・RevisionHistory統合システム

---

## 📊 総合評価

| 項目 | 評価 | コメント |
|------|------|----------|
| API責務分離 | ⭐⭐⭐⭐ | 良好。各APIが単一責任を持つ |
| フローの整合性 | ⭐⭐⭐ | 改定記号計算に問題あり |
| RevisionHistory | ⭐⭐⭐⭐ | 承認印の不変性は保たれている |
| 管理番号更新 | ⭐⭐⭐⭐ | 正しく実装されている |
| UI/API整合性 | ⭐⭐⭐⭐ | 適切に統合されている |
| セキュリティ | ⭐⭐⭐⭐⭐ | 全APIで認証・権限チェック済み |
| 型安全性 | ⭐⭐⭐⭐ | TypeScript型定義が適切 |

**総合スコア**: 27/35 (77%)

---

## ✅ 良好な点

### 1. トランザクション処理
すべての承認フローAPIで`prisma.$transaction()`を使用し、データ整合性を保証。

```typescript
// 例: app/api/documents/approve/route.ts
const result = await prisma.$transaction(async (tx) => {
  // 複数のDB操作をアトミックに実行
});
```

### 2. 認証・権限チェック
全APIで`requireAuth()`, `requireApprover()`を使用し、セキュリティを確保。

### 3. RevisionHistoryの不変性
過去の承認印は`RevisionHistory`テーブルに固定され、変更されない設計。

### 4. 管理番号の自動採番
`A-1`, `A-2`, `A-3`... の管理番号が承認時に正しく更新される。

### 5. UIとAPIの統合
承認者ダッシュボードに改定版バッジ、管理番号、改定記号が適切に表示される。

---

## ⚠️ 重大な問題点

### **問題1: 改定記号の計算ロジックが不正確**

**場所**: `app/api/documents/revise/route.ts` (Line 44)

**現在のコード**:
```typescript
const revisionCount = document.revisionHistories.length;
const newRevisionSymbol = `R${revisionCount + 1}`;
```

**問題点**:
- `revisionHistories`は**全レコード**を取得しているが、承認済み（`approved_at != null`）のみを数えるべき
- 改定開始時に作成される未承認レコードもカウントされ、改定記号が重複する可能性

**影響**:
- R1, R2, R3... の採番が不正確になる
- 同じ改定記号が複数回発行される可能性

**修正案**:
```typescript
// 承認済みの改定のみをカウント
const revisionCount = document.revisionHistories.filter(
  (r) => r.approved_at !== null
).length;
const newRevisionSymbol = `R${revisionCount + 1}`;
```

---

### **問題2: 管理番号の計算が承認済みレコードのみに限定されていない**

**場所**: `app/api/documents/approve/route.ts` (Line 39-41)

**現在のコード**:
```typescript
const approvedCount = document.revisionHistories.length;
const newRevisionNumber = approvedCount + 1;
const newManagementNumber = `A-${newRevisionNumber}`;
```

**問題点**:
- `revisionHistories`クエリで`where: { approved_at: { not: null } }`を指定しているため、現在は正しく動作
- しかし、コード上は`approvedCount`という変数名なのに、クエリに依存している

**改善案**:
変数名を明確にするか、コード内でフィルタリングを追加:
```typescript
// より明示的な実装
const approvedRevisions = document.revisionHistories.filter(
  (r) => r.approved_at !== null
);
const newRevisionNumber = approvedRevisions.length + 1;
const newManagementNumber = `A-${newRevisionNumber}`;
```

---

### **問題3: 改定フローでの`revisionSymbol`の初期値**

**場所**: `app/api/documents/revise/route.ts` (Line 53-61)

**問題点**:
改定開始時に`RevisionHistory`を作成するが、`management_number`が空文字列になっている:

```typescript
await tx.revisionHistory.create({
  data: {
    document_id: documentId,
    management_number: document.management_number || "",  // ← 空文字列の可能性
    revision_symbol: newRevisionSymbol,
    title: document.title,
    created_by_id: user.id,
  },
});
```

**影響**:
- 改定開始時のレコードに管理番号が記録されない
- 後で承認された時に更新されるが、履歴の一貫性が損なわれる

**修正案**:
改定開始時には`RevisionHistory`を作成せず、承認時にのみ作成する:
```typescript
// revise APIでは RevisionHistory を作成しない
// 承認時に初めて作成する方が、データの一貫性が保たれる
```

---

## 🔍 軽微な問題点

### **問題4: 型定義の重複**

**場所**: 
- `app/documents/page.tsx`
- `app/documents/[id]/page.tsx`
- `app/approver/page.tsx`

**問題点**:
同じ`Document`インターフェースが複数ファイルで重複定義されている。

**改善案**:
共通の型定義ファイルを作成:
```typescript
// types/document.ts
export interface Document {
  id: number;
  title: string;
  status: "draft" | "pending" | "approved";
  managementNumber?: string | null;
  creator: User;
  // ...
}
```

---

### **問題5: エラーメッセージの一貫性**

**場所**: 各API

**問題点**:
エラーメッセージが英語と日本語が混在している。

**改善案**:
エラーメッセージを統一した定数ファイルで管理:
```typescript
// lib/errors.ts
export const ErrorMessages = {
  UNAUTHORIZED: "認証が必要です",
  DOCUMENT_NOT_FOUND: "文書が見つかりません",
  ONLY_CREATOR_CAN_EDIT: "作成者のみ編集可能です",
  // ...
};
```

---

### **問題6: 不要なコードの残存**

**場所**: `lib/documentSearch.ts`, `lib/folderManagement.ts`

**問題点**:
- これらのファイルは古い実装（localStorage/ファイルシステムベース）の残骸
- 現在のPrismaベース実装とは無関係
- プロジェクトに混乱を招く

**改善案**:
- 使用されていない場合は削除
- または`_archived/`フォルダに移動

---

## 🚀 推奨される改善案

### **優先度: 高**

1. **改定記号の計算ロジック修正** (問題1)
2. **改定開始時のRevisionHistory作成の見直し** (問題3)

### **優先度: 中**

3. **型定義の共通化** (問題4)
4. **管理番号計算の明示化** (問題2)

### **優先度: 低**

5. **エラーメッセージの統一** (問題5)
6. **不要なコードの削除** (問題6)

---

## 📝 具体的な修正パッチ

### **修正1: 改定記号の計算ロジック**

**ファイル**: `app/api/documents/revise/route.ts`

```typescript
// 修正前
const revisionCount = document.revisionHistories.length;
const newRevisionSymbol = `R${revisionCount + 1}`;

// 修正後
const approvedRevisions = document.revisionHistories.filter(
  (r) => r.approved_at !== null
);
const newRevisionSymbol = `R${approvedRevisions.length + 1}`;
```

---

### **修正2: 改定開始時のRevisionHistory作成を削除**

**ファイル**: `app/api/documents/revise/route.ts`

```typescript
// 修正前
await tx.revisionHistory.create({
  data: {
    document_id: documentId,
    management_number: document.management_number || "",
    revision_symbol: newRevisionSymbol,
    title: document.title,
    created_by_id: user.id,
  },
});

// 修正後
// RevisionHistory は承認時にのみ作成する
// 改定記号はドキュメントの別フィールドに保存するか、
// approve API側で最新の改定記号を計算する
```

**注意**: この変更により、改定中の文書に対する改定記号の追跡方法を変更する必要があります。

**代替案**: Documentテーブルに`current_revision_symbol`フィールドを追加:

```prisma
model Document {
  // ...
  management_number String?
  current_revision_symbol String? // 改定中の改定記号
}
```

---

### **修正3: 管理番号計算の明示化**

**ファイル**: `app/api/documents/approve/route.ts`

```typescript
// 修正前
const approvedCount = document.revisionHistories.length;

// 修正後（より明示的）
const approvedRevisions = document.revisionHistories.filter(
  (r) => r.approved_at !== null
);
const approvedCount = approvedRevisions.length;
```

---

## 🔐 セキュリティレビュー

### ✅ 実装済み

- 全APIで`requireAuth()`による認証チェック
- 承認者APIで`requireApprover()`による権限チェック
- 作成者のみが自分の文書を編集可能
- SQLインジェクション対策（Prismaを使用）

### ⚠️ 追加検討事項

1. **CSRFトークン**: 現在の実装にはCSRF保護が含まれていない
2. **レート制限**: API呼び出しの頻度制限がない
3. **監査ログ**: 承認フローの詳細な監査ログが不足

---

## 🎯 結論

全体的に**良好な設計**ですが、以下の点に注意が必要です：

1. **改定記号の計算ロジック**を修正（最優先）
2. **改定開始時のRevisionHistory作成**を見直し
3. **型定義の共通化**でコードの保守性向上

これらの修正により、システムの信頼性と保守性が大幅に向上します。

---

## 📚 参考資料

- Prisma トランザクション: https://www.prisma.io/docs/concepts/components/prisma-client/transactions
- Next.js App Router 認証: https://nextjs.org/docs/app/building-your-application/authentication
- TypeScript 型定義ベストプラクティス: https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html
