1. プロダクト概要
本プロダクトは、企業内で扱われる業務文書を 作成・管理・承認・検索・活用 するための統合ドキュメントプラットフォームである。テンプレートベースの文書作成、厳密な承認フロー、フォルダ階層に基づく管理番号体系、全文検索、履歴管理、AI支援などを組み合わせ、製造業・品質管理・業務標準化領域に適した高精度な文書運用を実現する。
旧 LocalStorage ベースの文書管理システムは完全に廃止され、現在は Prisma + SQLite を基盤とした新しい文書管理システムに統合されている。

1.1 プロダクトの目的
- 文書の 標準化：テンプレートに基づく統一フォーマットで文書品質を均一化する
- 文書の 品質保証：checker → approver の承認フローにより正式文書を確定する
- 文書の 体系的管理：フォルダ階層 × 管理番号体系により文書を整理・分類する
- 文書の 検索性向上：全文検索・履歴・メタデータにより必要な文書を迅速に発見する
- 文書の 再利用性向上：テンプレート・AI生成により作成効率を向上する
- 文書の 改訂履歴の透明化：RevisionHistory により変更履歴を追跡可能にする

1.2 想定ユーザー（4ロール）
本プロダクトは以下の4ロールを前提に設計されている。
- 一般社員（user）：文書の作成・提出を行う
- チェッカー（checker）：文書内容を確認し、修正依頼または承認へ進める
- アプローバー（approver）：最終承認を行い、文書を正式版として確定する
- 管理者（admin）：組織マスタ、フォルダ、テンプレート、ユーザー管理など全体設定を行う

1.3 プロダクトを構成する主要機能
テンプレートエディタ（Template Editor）
A4/A3 の紙面上にブロック（テキスト・図形・画像・表）を配置し、文書のレイアウトを定義するエディタ。
- blocks が唯一のソース
- pages は UI 用の派生構造
- 保存形式は { blocks, paper, orientation }
- source="template" のブロックは Writer で locked になる
文書エディタ（Writer）
テンプレートを読み込み、文書を作成・編集・保存・提出するエディタ。
- テンプレート由来ブロックは locked
- 文書保存（新規 / 上書き）
- リビジョン管理（RevisionHistory）
- ページ追加・削除
- Undo/Redo
文書管理（Prisma ベース）
Prisma + SQLite に統合された文書管理システム。
- Document
- RevisionHistory
- ApprovalRequest
- Folder / UserFolderAccess
- DocumentType
- fullText 抽出
- aiIndexId（AI検索用）
承認フロー（Approval Workflow）
企業内の正式な承認プロセス。
- submit → checking → approving → approved
- reject / revise / withdraw
- checker → approver の順序固定
- ApprovalRequest モデルで状態管理
フォルダ管理（Folder Management）
文書の分類とアクセス権管理。
- 階層フォルダ
- UserFolderAccess による権限
- 管理番号の基盤となる folder.code
文書番号（Document Number）
フォルダ階層に基づく一意の管理番号。
{PARENT}-{CHILD}-{SEQ(3桁)}[-REV(2桁)]
例: MANUAL-WI-015-02
- submit API で sequence を確定
- revision は更新時に付与
- 管理番号は不変
文書検索・閲覧・履歴
- 全文検索（fullText）
- 文書一覧
- 文書詳細
- リビジョン履歴
- 承認履歴
AI 機能（将来機能）
- 文書ナレッジ検索（RAG）
- 文書生成・構成
- 過去文書の引用
- Writer との統合

1.4 非機能要件（競合 SaaS と同等レベル）
品質
- content JSON の後方互換性
- ブロック操作の一貫性
- エディタの安定性
性能
- ブロック数 200 まで快適に動作
- 検索応答 200ms 以内
- submit API 500ms 以内
信頼性
- 文書番号の重複禁止（DB トランザクション）
- リビジョン履歴の永続性
- Prisma トランザクション使用
セキュリティ
- RBAC
- フォルダアクセス権
- API 認証
保守性
- /ui はロジック禁止
- エディタロジックは hooks に集約
- migrations は書き換え禁止
拡張性
- プレビュー機能追加を前提
- AI 機能追加を前提
- ファイルアップロード追加を前提

1.5 現在の状態（2026年2月時点）
- 旧 LocalStorage システムは完全廃止
- Prisma ベースの文書管理が稼働
- テンプレートエディタ・Writer は復旧済み
- 承認フローは基本動作
- 検索・閲覧は安定
- 追加予定：プレビュー / アップロード / AI

2. システム構成（レイヤー構造）
本プロダクトは、文書作成・管理・承認・検索・AI 活用を一貫して扱うために、
Next.js App Router（Route Handlers）を基盤とした API レイヤー と
Prisma を基盤としたデータレイヤー を中心に構成される。
API は以下の 8 つの領域に分割され、
各領域は明確な責務を持つ。

2.1 API ルート構造（全体マップ）
.
├── admin
│   ├── departments
│   │   └── route.ts
│   ├── positions
│   │   └── route.ts
│   ├── sections
│   │   └── route.ts
│   └── users
│       ├── [id]
│       │   ├── folders
│       │   │   └── route.ts
│       │   └── route.ts
│       └── route.ts
├── auth
│   ├── forgot-password
│   │   └── route.ts
│   ├── me
│   │   └── route.ts
│   └── reset-password
│       └── route.ts
├── document-types
│   ├── [id]
│   │   └── route.ts
│   └── route.ts
├── documents
│   ├── [id]
│   │   ├── history
│   │   │   └── route.ts
│   │   ├── revisions
│   │   │   └── route.ts
│   │   └── route.ts
│   ├── approve
│   │   └── route.ts
│   ├── check
│   │   └── route.ts
│   ├── confirm
│   │   └── route.ts
│   ├── reject
│   │   └── route.ts
│   ├── revise
│   │   └── route.ts
│   ├── save-draft
│   │   └── route.ts
│   ├── submit
│   │   └── route.ts
│   ├── withdraw
│   │   └── route.ts
│   └── route.ts
├── folders
│   ├── [id]
│   │   └── route.ts
│   └── route.ts
├── login
│   └── route.ts
├── me
│   ├── email
│   │   └── route.ts
│   ├── password
│   │   └── route.ts
│   └── route.ts
├── register
│   └── route.ts
├── search
│   └── route.ts
├── templates
│   ├── [id]
│   │   └── route.ts
│   └── route.ts
├── users
│   └── route.ts
└── logout
2.2 レイヤー構造（責務分離）
本プロダクトは以下の 6 レイヤーで構成される。
① 認証・ユーザー管理レイヤー（auth / login / register / me / logout）
- ログイン / ログアウト
- パスワードリセット
- ユーザー情報取得・更新
- 認証トークンの検証
- RBAC（admin / checker / approver / user）
該当 API
/auth/*
/login
/logout
/register
/me/*
② 組織マスタレイヤー（admin/master）
- 部署（Department）
- セクション（Section）
- 役職（Position）
- ユーザー管理（admin/users）
該当 API
/admin/departments
/admin/sections
/admin/positions
/admin/users
/admin/users/[id]
/admin/users/[id]/folders
③ フォルダ管理レイヤー（folders）
- フォルダ作成 / 編集 / 削除
- フォルダ階層の管理
- UserFolderAccess によるアクセス権管理
該当 API
/folders
/folders/[id]
④ 文書管理レイヤー（documents）
文書の CRUD・リビジョン・履歴・承認フローを扱う中心レイヤー。
文書本体
/documents
/documents/[id]
リビジョン・履歴
/documents/[id]/revisions
/documents/[id]/history
承認フロー
/documents/submit
/documents/check
/documents/approve
/documents/reject
/documents/revise
/documents/withdraw
/documents/confirm
ドラフト保存
/documents/save-draft
⑤ テンプレート管理レイヤー（templates）
テンプレートの CRUD と content JSON の保存・取得を担当。
該当 API
/templates
/templates/[id]
⑥ 文書種別レイヤー（document-types）
文書種別（DocumentType）の CRUD。
該当 API
/document-types
/document-types/[id]
⑦ 検索レイヤー（search）
全文検索・メタデータ検索・AI検索（将来機能）を担当。
該当 API
/search
⑧ ユーザー情報レイヤー（users）
一般ユーザーの一覧取得・検索。
該当 API
/users
2.3 レイヤー間の依存関係
- 認証レイヤーは全レイヤーの前提
- 組織マスタはユーザーと文書の属性に影響
- フォルダ管理は文書番号生成に必須
- テンプレート管理は Writer の入力
- 文書管理は承認フローと密接に連動
- 検索レイヤーは Document.fullText と RevisionHistory を参照
依存関係の方向性は以下の通り：
auth → admin/master → folders → templates → documents → search
2.4 API 設計ポリシー（重要）
- Route Handlers（Next.js App Router）で統一
- Prisma を唯一のデータアクセス手段とする
- migrations は書き換え禁止（歴史として扱う）
- DTO（入出力）は固定し、後方互換性を維持
- UI コンポーネント層（/ui）は API を直接呼ばない
- エディタロジックは useTemplateEditor / useWriterEditor に集約
- content JSON の構造は絶対に変更しない（後方互換性必須）

2.5 現在の状態（2026年2月時点）
- 旧 LocalStorage システムは完全廃止
- Prisma ベースの API が全領域で稼働
- 文書管理・承認フロー・テンプレート管理は安定
- 検索は fullText ベースで動作
- 追加予定：プレビュー / アップロード / AI

3. データモデル（Prisma）
本プロダクトは、Prisma ORM を唯一のデータアクセスレイヤーとして採用し、
文書管理・承認フロー・テンプレート管理・フォルダ管理・ユーザー管理を
すべて Prisma モデルで統合している。
この章では、Prisma schema.prisma に基づき、
正式なデータモデル仕様・関係性・制約・役割 を定義する。

3.1 モデル一覧
本プロダクトで使用する Prisma モデルは以下の通り。
- Department
- Section
- Position
- User
- PasswordResetToken
- Folder
- user_folder_access
- DocumentType
- Document
- DocumentBlock
- ApprovalRequest
- ApprovalHistory
- RevisionHistory
- Template

3.2 モデル仕様（Prisma 準拠）
以下は、あなたが貼ってくれた Prisma スキーマを
AI_SPEC.md 用に正式な仕様として再構成したもの。

3.2.1 Department
model Department {
  id       Int       @id @default(autoincrement())
  name     String
  order    Int       @default(0)
  enabled  Boolean   @default(true)

  users    User[]
  sections Section[]
}
3.2.2 Section
model Section {
  id            Int        @id @default(autoincrement())
  name          String
  department_id Int
  department    Department @relation(fields: [department_id], references: [id])
  order         Int        @default(0)
  enabled       Boolean    @default(true)

  users         User[]
}
3.2.3 Position
model Position {
  id      Int     @id @default(autoincrement())
  name    String
  order   Int     @default(0)
  enabled Boolean @default(true)

  users   User[]
}
3.2.4 PasswordResetToken
model PasswordResetToken {
  id        Int      @id @default(autoincrement())
  user      User     @relation(fields: [userId], references: [id])
  userId    Int
  token     String   @unique
  expiresAt DateTime
  used      Boolean  @default(false)
}

3.2.5 User
model User {
  id            Int         @id @default(autoincrement())
  last_name     String
  first_name    String
  middle_name   String?
  name          String      // 自動生成（last + first + middle）
  email         String      @unique
  password      String

  role          String      @default("user") // user / creator / checker / approver / admin
  disabled      Boolean     @default(false)
  lastLogin     DateTime?

  department_id Int?
  section_id    Int?
  position_id   Int?

  department    Department? @relation(fields: [department_id], references: [id])
  section       Section?    @relation(fields: [section_id], references: [id])
  position      Position?   @relation(fields: [position_id], references: [id])

  created_at DateTime @default(now())

  // 承認ワークフロー
  approvalHistories ApprovalHistory[]
  approvalApprovers ApprovalRequest[] @relation("ApprovalApprover")
  approvalCheckers  ApprovalRequest[] @relation("ApprovalChecker")
  approvalRequests  ApprovalRequest[] @relation("ApprovalRequester")

  // 文書作成・改訂
  createdDocuments  Document[]        @relation("DocumentCreator")
  createdRevisions  RevisionHistory[] @relation("RevisionCreatedBy")
  checkedRevisions  RevisionHistory[] @relation("RevisionCheckedBy")
  approvedRevisions RevisionHistory[] @relation("RevisionApprovedBy")

  // テンプレート作成
  createdTemplates Template[] @relation("TemplateCreator")

  // フォルダアクセス権
  userFolderAccesses user_folder_access[]

  // パスワードリセット
  passwordResetTokens PasswordResetToken[]

  @@map("users")
}
3.2.6 Folder（階層構造）
model Folder {
  id   Int    @id @default(autoincrement())
  name String
  code String @unique

  parent_id Int?
  parent    Folder?  @relation("FolderTree", fields: [parent_id], references: [id])
  children  Folder[] @relation("FolderTree")

  created_at DateTime @default(now())

  documents Document[]
  userFolderAccesses user_folder_access[]

  @@map("folders")
}
3.2.7 user_folder_access（フォルダアクセス権）
model user_folder_access {
  id Int @id @default(autoincrement())

  userId   Int
  folderId Int

  canRead  Boolean @default(true)
  canWrite Boolean @default(false)

  user   User   @relation(fields: [userId], references: [id])
  folder Folder @relation(fields: [folderId], references: [id])

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([userId, folderId])
  @@map("user_folder_access")
}
3.2.8 DocumentType
model DocumentType {
  id          Int     @id @default(autoincrement())
  code        String  @unique
  name        String
  description String?
  order       Int     @default(0)

  created_at DateTime @default(now())
  updated_at DateTime @updatedAt

  documents Document[]

  @@map("document_types")
}
3.2.9 Document（最重要）
model Document {
  id    Int    @id @default(autoincrement())
  title String

  status String @default("draft") // draft / checking / approved など

  creator_id       Int
  template_id      Int?
  folder_id        Int?
  document_type_id Int?

  sequence Int? // フォルダ内連番
  revision Int @default(0)

  management_number String?

  created_at DateTime @default(now())
  updated_at DateTime @updatedAt

  approvalHistories ApprovalHistory[]
  approvalRequest   ApprovalRequest?

  blocks DocumentBlock[]

  documentType DocumentType? @relation(fields: [document_type_id], references: [id])
  creator      User          @relation("DocumentCreator", fields: [creator_id], references: [id])
  folder       Folder?       @relation(fields: [folder_id], references: [id])

  revisionHistories RevisionHistory[]

  @@unique([folder_id, sequence])
  @@map("documents")
}
3.2.10 DocumentBlock（本文ブロック）
model DocumentBlock {
  id          Int @id @default(autoincrement())
  document_id Int

  type    String
  content String

  position_x Float
  position_y Float
  width      Float
  height     Float

  sort_order Int @default(0)

  document Document @relation(fields: [document_id], references: [id], onDelete: Cascade)

  @@map("document_blocks")
}
3.2.11 ApprovalRequest（承認要求）
model ApprovalRequest {
  id Int @id @default(autoincrement())

  document_id Int @unique

  requester_id Int
  checker_id   Int
  approver_id  Int

  requested_at DateTime  @default(now())
  comment      String?
  checked_at   DateTime?

  approver  User     @relation("ApprovalApprover", fields: [approver_id], references: [id])
  checker   User     @relation("ApprovalChecker", fields: [checker_id], references: [id])
  requester User     @relation("ApprovalRequester", fields: [requester_id], references: [id])
  document  Document @relation(fields: [document_id], references: [id], onDelete: Cascade)

  @@map("approval_requests")
}
3.2.12 ApprovalHistory（承認履歴）
model ApprovalHistory {
  id          Int @id @default(autoincrement())
  document_id Int
  user_id     Int

  action String
  comment    String?
  created_at DateTime @default(now())

  user     User     @relation(fields: [user_id], references: [id])
  document Document @relation(fields: [document_id], references: [id], onDelete: Cascade)

  @@map("approval_history")
}
3.2.13 RevisionHistory（改訂履歴）
model RevisionHistory {
  id          Int @id @default(autoincrement())
  document_id Int

  management_number String
  revision_symbol   String
  title             String

  approved_by_id Int?
  checked_by_id  Int?
  created_by_id  Int

  approved_at DateTime?
  created_at  DateTime @default(now())

  createdBy  User     @relation("RevisionCreatedBy", fields: [created_by_id], references: [id])
  checkedBy  User?    @relation("RevisionCheckedBy", fields: [checked_by_id], references: [id])
  approvedBy User?    @relation("RevisionApprovedBy", fields: [approved_by_id], references: [id])
  document   Document @relation(fields: [document_id], references: [id], onDelete: Cascade)

  @@map("revision_history")
}

3.2.14 Template
model Template {
  id      Int    @id @default(autoincrement())
  name    String
  content String

  created_by Int
  created_at DateTime @default(now())
  updated_at DateTime @updatedAt

  creator User @relation("TemplateCreator", fields: [created_by], references: [id])

  @@map("templates")
}

3.3 Document.content（blocks）の正式仕様
※ これは DocumentBlock とは別。
※ Writer / TemplateEditor が扱う エディタ用 JSON。
すでにあなたと作成した Block JSON Schema をここに配置する。
{
  "definitions": {
    "Block": {
      "type": "object",
      "required": [
        "id",
        "type",
        "x",
        "y",
        "width",
        "height",
        "rotate",
        "isEditing",
        "locked",
        "editable",
        "source"
      ],
      "properties": {
        "id": { "type": "string" },

        "type": {
          "type": "string",
          "enum": [
            "text",
            "rect",
            "circle",
            "triangle",
            "arrow",
            "line",
            "image",
            "table",
            "titlePlaceholder",
            "subtitlePlaceholder"
          ]
        },

        "x": { "type": "number" },
        "y": { "type": "number" },
        "width": { "type": "number" },
        "height": { "type": "number" },
        "rotate": { "type": "number" },

        "isEditing": { "type": "boolean" },
        "locked": { "type": "boolean" },
        "editable": { "type": "boolean" },

        "source": {
          "type": "string",
          "enum": ["template", "user"]
        },

        "zIndex": { "type": "number" },

        "label": { "type": "string" },
        "fontSize": { "type": "number" },
        "fontFamily": { "type": "string" },
        "textAlign": {
          "type": "string",
          "enum": ["left", "center", "right"]
        },
        "color": { "type": "string" },

        "fillColor": { "type": "string" },
        "borderColor": { "type": "string" },
        "borderWidth": { "type": "number" },

        "src": { "type": "string" },

        "rows": { "type": "number" },
        "cols": { "type": "number" },

        "cells": {
          "type": "array",
          "items": {
            "type": "array",
            "items": {
              "type": "object",
              "required": [
                "text",
                "fontSize",
                "fontWeight",
                "color",
                "width",
                "height"
              ],
              "properties": {
                "text": { "type": "string" },
                "fontSize": { "type": "number" },
                "fontWeight": {
                  "type": "string",
                  "enum": ["normal", "bold"]
                },
                "color": { "type": "string" },
                "width": { "type": "number" },
                "height": { "type": "number" }
              }
            }
          }
        },

        "value": { "type": "string" }
      }
    }
  }
}
3.4 モデル間の関係図（概要）
- Department 1:N Section
- Section 1:N User
- Position 1:N User
- Folder 1:N Folder（階層構造）
- Folder 1:N Document
- User 1:N Document（creator）
- Document 1:N DocumentBlock
- Document 1:N RevisionHistory
- Document 1:1 ApprovalRequest
- User 1:N ApprovalHistory
- User 1:N ApprovalRequest（checker / approver / requester）
- Template 1:N Document

3.5 データモデルに関する非機能要件
- Prisma を唯一のデータアクセス手段とする
- migrations は書き換え禁止
- Document.content（blocks）は後方互換性を維持
- DocumentBlock は Writer の内部構造とは別物
- 文書番号（sequence）は folder_id 単位でユニーク
- ApprovalRequest は文書につき 1 つ
- RevisionHistory は全量保存（差分保存はしない）


4. 文書番号（Document Number）仕様
文書番号（management_number）は、文書を一意に識別し、フォルダ階層・文書種別・改訂履歴を体系的に管理するための識別子である。
本プロダクトでは、フォルダ階層 × 連番（sequence） × 改訂番号（revision） を組み合わせた形式を採用する。

4.1 文書番号の構造
文書番号は以下の形式で構成される。
{FOLDER_CODE_HIERARCHY}-{SEQUENCE(3桁)}[-{REVISION(2桁)}]


例
- WI-001
- MANUAL-WI-015
- MANUAL-WI-015-02

4.2 フォルダコード階層（Folder.code）
Prisma モデルの Folder は階層構造を持つ。
Folder {
  id        Int
  code      String @unique
  parent_id Int?
}
文書番号の prefix は、
親 → 子フォルダの順に code を - で連結したもの。
例：
MANUAL (code="MANUAL")
  └── WI (code="WI")

文書番号 prefix：
MANUAL-WI

4.3 連番（sequence）の仕様
Prisma モデル：
sequence Int?
@@unique([folder_id, sequence])

仕様
- sequence は folder_id 単位で採番される
- 3 桁ゼロ埋め（001, 002, 003…）
- draft 状態では null
- submit API で正式に確定
- フォルダ内でユニーク
- トランザクションで採番すること

4.4 改訂番号（revision）の仕様
Prisma モデル：
revision Int @default(0)


仕様
- 初回作成時は revision = 0（文書番号に付与しない）
- 改訂時に revision を +1
- 文書番号には 2 桁ゼロ埋めで付与（01, 02…）
- prefix と sequence は改訂しても変わらない

4.5 文書番号の生成タイミング
文書番号は submit（承認申請）時に確定する。
submit API の処理
- folder_id を確認
- sequence を採番（MAX + 1）
- revision = 0 を確認
- folder.code 階層を取得
- 文書番号を生成
- Document.management_number に保存
- RevisionHistory にも同じ番号を保存

4.6 文書番号の不変性
- submit 後は 文書番号は変更不可
- フォルダ移動しても文書番号は変わらない
- 文書種別を変更しても文書番号は変わらない
- 改訂時は revision のみ増加し、prefix と sequence は変わらない

4.7 連番変更（sequence override）仕様（重要）
現場運用に対応するため、
draft 状態に限り sequence（連番）を手動で変更できる。
変更可能条件
- Document.status = "draft"
- folder_id が null でない
- sequence は 1〜999 の整数
- folder_id 単位で重複チェック必須
- 変更後は management_number を再生成
- revision は 0 のまま
変更不可条件
- checking / approving / approved
- rejected / revise 中
- revision > 0（改訂後）
目的
- PDF などの追加資料に合わせて番号を調整
- 過去文書の番号体系に合わせる
- 欠番を埋める
- 現場の柔軟な運用に対応

4.8 文書番号生成関数（正式仕様）
export function generateManagementNumber(
  folder: { code: string; parent?: { code: string } | null },
  sequence: number,
  revision: number
): string {
  let base = folder.code;
  if (folder.parent && folder.parent.code) {
    base = `${folder.parent.code}-${base}`;
  }
  let number = `${base}-${String(sequence).padStart(3, "0")}`;
  if (revision > 0) {
    number += `-${String(revision).padStart(2, "0")}`;
  }
  return number;
}
4.8 文書番号の例（テキスト形式）
以下は文書番号の例をテキストで示したもの。
- フォルダ階層「WI」、sequence=1、revision=0 → 文書番号は「WI-001」
- フォルダ階層「MANUAL → WI」、sequence=15、revision=0 → 文書番号は「MANUAL-WI-015」
- フォルダ階層「MANUAL → WI」、sequence=15、revision=2 → 文書番号は「MANUAL-WI-015-02」
- フォルダ階層「SAFETY → PROC → WI」、sequence=3、revision=1 → 文書番号は「SAFETY-PROC-WI-003-01」

5. 承認フロー仕様
承認フローは、文書の品質保証と統制を実現するための中心機能であり、
作成者 → チェッカー → アプローバー の順に進む 3 段階のワークフローで構成される。
承認フローは Document モデルと ApprovalRequest モデルを基盤とし、
文書の状態（status）と承認要求（ApprovalRequest）が同期して動作する。

5.1 承認フローの全体像
承認フローは次のステップで構成される。
- 作成者が文書を作成し、draft 状態で保存する
- 作成者が submit（承認申請）を行う
- チェッカーが確認し、承認または差戻しを行う
- アプローバーが最終承認を行う
- 文書は approved（正式文書）となる
承認フローは常に 1 文書につき 1 つの ApprovalRequest で管理される。

5.2 文書ステータス（Document.status）
Document.status は次の値を取る。
- draft
- checking
- approving
- approved
- rejected
- revising
各状態の意味は以下の通り。
- draft：作成中。承認フロー未開始
- checking：チェッカーによる確認中
- approving：アプローバーによる最終承認中
- approved：正式文書
- rejected：チェッカーまたはアプローバーによる差戻し
- revising：改訂作業中（approved 文書の改訂）

5.3 ApprovalRequest の構造
Prisma モデルは次の通り。
ApprovalRequest {
  id
  document_id (unique)
  requester_id
  checker_id
  approver_id
  requested_at
  comment
  checked_at
}

仕様：
- 文書 1 件につき ApprovalRequest は 1 件のみ
- requester_id は作成者
- checker_id は確認者
- approver_id は承認者
- comment は差戻し理由などに使用
- checked_at はチェッカーが処理した時刻

5.4 submit（承認申請）
submit は承認フローの開始点であり、次の処理を行う。
- 文書が draft 状態であることを確認
- folder_id が設定されていることを確認
- sequence を採番し、文書番号を生成
- Document.status を checking に変更
- ApprovalRequest を作成
- RevisionHistory を作成（初版として revision=0 を保存）
submit 後は文書番号は変更不可となる。

5.5 チェッカーの処理（check）
チェッカーは次の 2 種類の処理を行う。
1. 承認（approve to next stage）
- Document.status を approving に変更
- ApprovalRequest.checked_at を更新
- comment があれば保存
2. 差戻し（reject）
- Document.status を rejected に変更
- ApprovalRequest.comment に理由を保存
差戻し後、作成者は文書を修正し、再度 submit できる。

5.6 アプローバーの処理（approve）
アプローバーは最終承認を行う。
処理内容：
- Document.status を approved に変更
- ApprovalRequest を完了状態として扱う
- RevisionHistory に正式版として記録
- 文書は正式文書となり、以後は改訂フローに入る

5.7 差戻し（reject）
reject はチェッカーまたはアプローバーが実行できる。
仕様：
- Document.status を rejected に変更
- ApprovalRequest.comment に差戻し理由を保存
- 作成者は修正後に再 submit できる
- sequence と management_number は再利用される（変更不可）

5.8 改訂（revise）
approved 文書は revise により改訂できる。
改訂フロー：
- Document.status を revising に変更
- 作成者が内容を修正
- submit により再度承認フローへ
- revision を +1
- 文書番号に revision を付与（例：01 → 02）
- RevisionHistory に改訂版を保存
prefix と sequence は変わらない。

5.9 承認フローの不変ルール
承認フローには次の不変ルールがある。
- 承認順序は「作成者 → チェッカー → アプローバー」で固定
- Document.status と ApprovalRequest の状態は常に同期
- submit 後は文書番号を変更できない
- approved 文書は直接編集できない（revise のみ可能）
- ApprovalRequest は文書 1 件につき常に 1 件
- 改訂時は revision のみ増加し、sequence は変わらない

5.10 承認フローの例（テキスト形式）
以下は承認フローの典型的な流れ。
- 作成者が文書を作成し、draft 状態で保存
- 作成者が submit を実行
- 文書番号が確定し、status が checking になる
- チェッカーが確認し、問題なければ approving に進める
- アプローバーが承認し、status が approved になる
- 文書は正式文書として固定される
- 改訂が必要になれば revise → submit → checking → approving → approved の流れを繰り返す

5.11 ロール別の承認フロー権限
作成者（requester）
- すべてのアカウントが作成者になれる
- role = user / creator / checker / approver / admin
→ 全員が文書を作成し、submit（承認申請）できる
確認者（checker）
- checker と approver が確認者になれる
- role = checker
- role = approver
- role = admin（管理者は全ロール代行可能）
承認者（approver）
- approver のみが承認者になれる
- role = approver
- role = admin（管理者は代行可能）

5.12 ロール仕様の理由
- 現場では「上位ロールは下位ロールの作業を代行できる」運用が一般的
- approver は checker の役割も兼ねられる
- admin は全ロールを代行できる
- user（一般社員）は承認権限を持たないが、文書作成は可能
- これにより、柔軟な承認フローを維持しつつ、統制も保てる

5.13 ApprovalRequest への割り当てルール
submit 時に指定される checkerId / approverId は、
次の条件を満たす必要がある。
checkerId の条件
- ユーザーの role が checker / approver / admin のいずれか
- disabled = false
- フォルダアクセス権（読み取り権限）があること
approverId の条件
- ユーザーの role が approver / admin のいずれか
- disabled = false
- フォルダアクセス権（読み取り権限）があること
requesterId の条件
- すべてのユーザーが requester になれる
- disabled = false

5.14 UI での選択制御（Writer / Submit モーダル）
submit モーダルでは、次のようにユーザー一覧をフィルタリングする。
チェッカー候補
- role ∈ {checker, approver, admin}
アプローバー候補
- role ∈ {approver, admin}
作成者（requester）
- ログインユーザー自身

5.15 不正割り当ての防止（API 側）
API では次のチェックを必ず行う。
checker の割り当てチェック
if (checker.role not in ["checker", "approver", "admin"]) {
    throw Error("Invalid checker role");
}
approver の割り当てチェック
if (approver.role not in ["approver", "admin"]) {
    throw Error("Invalid approver role");
}
requester のチェック
- requester はログインユーザーであること
- disabled = false

5.16 ロールと承認フローの関係（テキスト版）
- user → 文書作成のみ可能
- creator → 文書作成のみ可能（user と同等）
- checker → 文書作成 + 確認が可能
- approver → 文書作成 + 確認 + 承認が可能
- admin → 全ロールを代行可能

5.17 まとめ（承認フローにおけるロール権限）
- 作成者（requester）：全ユーザー
- 確認者（checker）：checker / approver / admin
- 承認者（approver）：approver / admin
この仕様を 5章に統合すれば、
承認フローのロール制御は完全に明確化され、
AI が誤ったロール割り当てを行うこともなくなる。

6. 改訂（Revision）と差分表示（Diff）仕様
改訂は、正式文書（approved）に対して内容を更新するためのプロセスであり、
revision の増加・RevisionHistory の追加・差分表示 を中心に構成される。
改訂は文書の信頼性と追跡性を保証するための重要機能であり、
Document モデルと RevisionHistory モデルを基盤として動作する。

6.1 改訂の基本ルール
改訂は次のルールに従う。
- approved 文書のみ改訂できる
- 改訂開始時に Document.status を revising に変更する
- 改訂中は文書を自由に編集できる
- submit により再度承認フローに入る
- 承認されると revision が +1 される
- 文書番号は prefix と sequence を維持し、revision のみ増加する
- 改訂前の内容は RevisionHistory に保存される

6.2 改訂時の revision の扱い
revision は整数で管理される。
- 初版（初回承認）は revision = 0
- 改訂 1 回目は revision = 1
- 改訂 2 回目は revision = 2
- 文書番号には 2 桁ゼロ埋めで付与する（01, 02, 03…）
- prefix（フォルダ階層）と sequence（連番）は変わらない
例：
revision=0 → MANUAL-WI-015
revision=1 → MANUAL-WI-015-01
revision=2 → MANUAL-WI-015-02

6.3 RevisionHistory の保存内容
RevisionHistory は次の情報を保存する。
- document_id
- management_number（改訂時点の文書番号）
- revision_symbol（A, B, C… などの改訂記号）
- title
- created_by_id（改訂作業者）
- checked_by_id（チェッカー）
- approved_by_id（アプローバー）
- created_at（改訂作成日時）
- content（Document.content の全量）
特に重要なのは content を全量保存すること。
差分表示はこの content を基準に行う。

6.4 差分表示（Diff）の目的
差分表示は、改訂時に「どこが変更されたか」を明確に示すための機能である。
目的は次の通り。
- チェッカーが変更点を素早く確認できる
- アプローバーが承認判断をしやすくなる
- 作成者が自分の変更点を把握できる
- 文書の透明性と追跡性を高める

6.5 差分の比較対象
差分は次の 2 つの content を比較して行う。
- 旧バージョン：RevisionHistory.content
- 新バージョン：Document.content（改訂後の最新内容）
比較対象は blocks（Block JSON Schema） のみ。
DocumentBlock（DB の document_blocks）は比較対象にしない。

6.6 差分の分類
差分は次の 3 種類に分類される。
- 追加されたブロック
- 削除されたブロック
- 変更されたブロック
ブロックは id により同一性を判定する。

6.7 変更されたブロックの判定
変更されたブロックは、
id が一致し、いずれかのフィールドが異なる場合 とする。
比較対象フィールドは Block JSON Schema に基づく。
例：
- テキスト内容（label）が変わった
- 位置（x, y）が変わった
- サイズ（width, height）が変わった
- 色（color）が変わった
- 図形の fillColor が変わった
- 画像の src が変わった
- テーブルの cellsrow][col].text が変わった
- タイトルの value が変わった

6.8 差分表示の UI 仕様（テキスト形式）
UI では次のように表示する。
- 追加されたブロック：緑色でハイライト
- 削除されたブロック：赤色でハイライト
- 変更されたブロック：黄色でハイライト
- テーブルはセル単位で変更箇所をハイライト
- タイトル・サブタイトルは value の変更をハイライト

6.9 差分アルゴリズム（正式仕様）
差分は次の手順で計算する。
- oldBlocks = RevisionHistory.content.blocks
- newBlocks = Document.content.blocks
- oldBlocks の id をキーにマップ化
- newBlocks の id をキーにマップ化
- 次の分類を行う
- new にあって old にない → 追加
- old にあって new にない → 削除
- 両方にある → フィールド比較して変更判定
フィールド比較は Block JSON Schema に基づき、
type ごとに存在するフィールドのみ比較する。

6.10 差分の保存
差分そのものは DB に保存しない。
必要なときに計算する。
理由：
- content は JSON で完全保存されている
- 差分は動的に生成できる
- 保存すると後方互換性の問題が発生する

6.11 改訂フローの例（テキスト形式）
- 文書が approved になる
- 作成者が revise を開始し、status が revising になる
- 作成者が内容を編集する
- submit により承認フローに入る
- チェッカーが差分を確認し、承認または差戻し
- アプローバーが差分を確認し、承認
- revision が +1 される
- 文書番号が更新される（例：01 → 02）
- RevisionHistory に改訂版が保存される
6.12 承認履歴のページ埋め込み（1ページ目への自動生成）
承認フローで発生した履歴（requested / checked / approved / rejected）は、
文書の1ページ目に表形式で自動生成されるブロックとして埋め込む。
目的
- 文書そのものに承認の証跡を残す
- PDF 出力時に承認履歴が必ず含まれる
- 紙文書運用との互換性を確保する
仕様
- Writer で文書を開いた際、1ページ目の最上部に承認履歴ブロックを自動生成する
- このブロックは source="system" として扱い、ユーザー編集不可（locked=true）
- 表形式の Block（type="table"）として生成する
- 表の内容は ApprovalHistory モデルをもとに動的に構築する
- 改訂時は RevisionHistory の内容も含めて再生成する
- 表の幅はページ幅いっぱいに固定する
- 表の高さは行数に応じて自動調整する
表の構造（テキスト形式）
行は次の情報を含む。
- 日付（YYYY-MM-DD HH:mm）
- 操作（requested / checked / approved / rejected）
- 実行者（User.name）
- コメント（差戻し理由・改訂理由など）
6.13 改訂理由（Revision Comment）の扱い
改訂時には、作成者が 改訂理由（revision_comment） を入力できる。
仕様
- revise 開始時に改訂理由入力欄を表示する
- 改訂理由は RevisionHistory.comment として保存する
- 改訂理由は承認履歴表の中にも表示する
- 改訂理由は差分表示とは別に扱う（diff は内容差分、comment は意図説明）
表への反映
改訂理由は次のように表示される。
2026-03-01 09:15  revising   田中次郎  改訂理由：手順3の誤記修正
6.14 承認履歴ブロックの生成ルール
承認履歴ブロックは Document.content.blocks に次のように追加される。
- type="table"
- source="system"
- locked=true
- editable=false
- zIndex は最前面
- page=1 に固定配置
- x=0, y=0 に固定
- width はページ幅
- height は行数に応じて自動計算
ブロックの再生成タイミング
- submit（承認申請）時
- check（確認）時
- approve（承認）時
- reject（差戻し）時
- revise（改訂開始）時
- 改訂版が approved になった時
ブロックの再生成方法
- 既存の承認履歴ブロックを削除
- 最新の ApprovalHistory + RevisionHistory をもとに新しい表ブロックを生成
- Document.content.blocks の先頭に挿入

6.15 承認履歴と差分表示の関係
承認履歴は 「誰が何をしたか」 を示すメタ情報であり、
差分表示は 「文書のどこが変わったか」 を示す技術情報である。
両者は次のように連携する。
- チェッカーは承認履歴表を見て「誰が何をしたか」を確認
- 同時に差分表示で「どこが変わったか」を確認
- アプローバーも同様に両方を参照して承認判断を行う

6.16 承認履歴の永続化
承認履歴は次の 2 つの場所に保存される。
- ApprovalHistory（DB）
- 永続的な履歴
- 誰が・いつ・何をしたか
- コメント（差戻し理由・改訂理由）
- Document.content.blocks（1ページ目の表）
- 文書内に埋め込まれる履歴
- PDF 出力時に必ず含まれる
- UI 上で常に閲覧可能

6.17 承認履歴の例（テキスト形式）
2026-02-26 10:12  requested  山田太郎  -
2026-02-26 11:03  checked    佐藤花子  内容確認済み
2026-02-26 11:20  approved   鈴木一郎  承認します
2026-03-01 09:15  revising   田中次郎  改訂理由：手順3の誤記修正
2026-03-01 10:00  checked    佐藤花子  改訂内容確認済み
2026-03-01 10:20  approved   鈴木一郎  改訂版承認

