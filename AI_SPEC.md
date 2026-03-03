1. プロダクト概要（最終統合版）
本プロダクトは、企業内で扱われる業務文書を作成・管理・承認・検索・活用するための統合ドキュメントプラットフォームである。テンプレートベースの文書作成、厳密な承認フロー、フォルダ階層に基づく管理番号体系、全文検索、履歴管理、AI支援などを組み合わせ、製造業・品質管理・業務標準化領域に適した高精度かつ監査性の高い文書運用を実現する。
旧LocalStorageベースの文書管理システムは完全に廃止され、現在はPrisma + SQLiteを基盤としたサーバーサイド文書管理システムに統合されている。これにより、データの永続性・整合性・検索性・承認フローの厳密性が大幅に向上した。

1.1 プロダクトの目的
- 文書の標準化：テンプレートに基づく統一フォーマットで文書品質を均一化する
- 文書の品質保証：checker → approver の承認フローにより正式文書を確定する
- 文書の体系的管理：フォルダ階層 × 管理番号体系により文書を整理・分類する
- 文書の検索性向上：全文検索・履歴・メタデータにより必要な文書を迅速に発見する
- 文書の再利用性向上：テンプレート・AI 生成により作成効率を向上する
- 改訂履歴の透明化：RevisionHistory により変更履歴を完全に追跡可能にする

1.2 想定ユーザー（5ロール）
本プロダクトは以下の5ロールを前提に設計されている。
（※ロール体系は 11章の権限モデルと完全に一致する）
- user：文書の閲覧のみ可能（読み取り専用）
- creator：文書の作成・編集・提出が可能
- checker：文書の確認（check）が可能
- approver：文書の承認（approve）が可能
- admin：すべての操作が可能
※creatorロールは3章（Userモデル）・5章（承認フロー）・11章（権限モデル）と整合するよう正式に定義。

1.3 プロダクトを構成する主要機能
A4/A3の紙面上にブロック（テキスト・図形・画像・表）を配置し、文書のレイアウトを定義するエディタ。
A4/A3 の紙面上にブロック（テキスト・図形・画像・表）を配置し、文書のレイアウトを定義するエディタ。
- blocks が唯一のソース
- pagesはUI用の派生構造
- 保存形式は{ blocks, paper, orientation }
- source="template"のブロックはWriterでlockedになる

文書エディタ（Writer）
テンプレートを読み込み、文書を作成・編集・保存・提出するエディタ。
- テンプレート由来ブロックはlocked
- 文書保存（新規／上書き）
- リビジョン管理（RevisionHistory）
- ページ追加・削除
- Undo/Redo
- 自動保存（クラッシュ耐性）

文書管理（Prisma ベース）
Prisma + SQLiteに統合された文書管理システム。
- Document
- RevisionHistory
- ApprovalRequest
- Folder / UserFolderAccess
- DocumentType
- fullText抽出
- aiIndexId（AI検索用）

承認フロー（Approval Workflow）
企業内の正式な承認プロセス。
- submit → checking → approving → approved
- reject／revise／withdraw
- checker → approverの順序固定
- ApprovalRequestモデルで状態管理
（※状態遷移は5章を唯一の正とする）

フォルダ管理（Folder Management）
文書の分類とアクセス権管理。
- 階層フォルダ
- UserFolderAccessによる権限
- 管理番号の基盤となるfolder.code

文書番号（Document Number）
フォルダ階層に基づく一意の管理番号。
- 形式：{PARENT}-{CHILD}-{SEQ(3桁)}[-REV(2桁)]
- 例：MANUAL-WI-015-02
- submit APIでsequenceを確定
- revisionは更新時に付与
- 管理番号は不変
（※詳細仕様は4章に統一）

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
- Writerとの統合
（※AIインデックス対象はfullTextのみ。7章に統一）

1.4 非機能要件（競合SaaSと同等レベル）
品質
- content JSONの後方互換性
- ブロック操作の一貫性
- エディタの安定性
性能
- ブロック数200まで快適に動作
- 検索応答200ms以内
- submit API 500ms以内
信頼性
- 文書番号の重複禁止（DBトランザクション）
- リビジョン履歴の永続性
- Prismaトランザクション使用
セキュリティ
- RBAC（ロールベースアクセス制御）
- フォルダアクセス権
- API認証
保守性
- /uiはロジック禁止
- エディタロジックはhooksに集約
- migrationsは書き換え禁止
拡張性
- プレビュー機能追加を前提
- AI機能追加を前提
- ファイルアップロード追加を前提

1.5 現在の状態（2026年2月時点）
- 旧LocalStorageシステムは完全廃止
- Prismaベースの文書管理が稼働
- テンプレートエディタ・Writerは復旧済み
- 承認フローは基本動作
- 検索・閲覧は安定
- 追加予定：プレビュー／アップロード／AI


2. システム構成（レイヤー構造）［最終統合版］
本プロダクトは、文書の 作成・管理・承認・検索・AI 活用 を一貫して扱うために、
Next.js App Router（Route Handlers）を基盤とした API レイヤー と、
Prisma を基盤とした データレイヤー を中心に構成される。
API は以下の 8 領域に分割され、各領域は明確な責務を持つ。

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
本プロダクトは以下の 8 レイヤー で構成される。

① 認証・ユーザー管理レイヤー（auth / login / register / me / logout）
- ログイン / ログアウト
- パスワードリセット
- ユーザー情報取得・更新
- 認証トークンの検証
- RBAC（user / creator / checker / approver / admin）
該当 API
/auth/*
/login
/logout
/register
/me/*

② 組織マスタレイヤー（admin）
- 部署（Department）
- セクション（Section）
- 役職（Position）
- ユーザー管理（admin/users）
※「master」という表記は廃止し、admin に統一。
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
※状態遷移は 5章を唯一の正 とする。

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
※AI インデックス対象は fullText のみ（7章に統一）。

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
依存関係の方向性：
auth → admin → folders → templates → documents → search

2.4 API 設計ポリシー（重要）
- Route Handlers（Next.js App Router）で統一
- Prisma を唯一のデータアクセス手段とする
- migrations は書き換え禁止（歴史として扱う）
- DTO（入出力）は固定し、後方互換性を維持
- UI コンポーネント層（/ui）は API を直接呼ばない
- エディタロジックは useTemplateEditor / useWriterEditor に集約
- Document.content は JSON として Document テーブルに保存する
- Prisma の DocumentBlock モデルは使用しない（将来的に削除予定）
- content JSON の構造は絶対に変更しない（後方互換性必須）

2.5 現在の状態（2026年2月時点）
- 旧 LocalStorage システムは完全廃止
- Prisma ベースの API が全領域で稼働
- 文書管理・承認フロー・テンプレート管理は安定
- 検索は fullText ベースで動作
- 追加予定：プレビュー / アップロード / AI


3. データモデル（Prisma）［最終統合版］
本プロダクトは Prisma ORM を唯一のデータアクセスレイヤーとして採用し、
文書管理・承認フロー・テンプレート管理・フォルダ管理・ユーザー管理を
すべて Prisma モデルで統合している。
本章では、schema.prisma を基準とした 正式なデータモデル仕様・関係性・制約 を定義する。

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
- DocumentBlock（※後述の通り、API/Editor の content JSON とは別物）
- ApprovalRequest
- ApprovalHistory
- RevisionHistory
- Template

3.2 モデル仕様（Prisma 準拠）
以下は Prisma スキーマを仕様書向けに再構成したもの。

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

3.2.5 User（ロール体系は 1章・11章と統一済み）
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

3.2.9 Document（最重要モデル）
model Document {
  id    Int    @id @default(autoincrement())
  title String

  status String @default("draft") // draft / checking / approving / approved / rejected / revising

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

Document.status の正式仕様（5章と統一）
- draft：作成中
- checking：確認待ち
- approving：承認待ち
- approved：承認済み
- rejected：差戻し
- revising：改訂作業中（approved → revise の状態）
※状態遷移は 5章の表を唯一の正 とする。

3.2.10 DocumentBlock（本文ブロック）
※ DocumentBlock は Editor の content JSON とは別物
※ content JSON は Document テーブルに JSON として保存する（2章で統一済み）

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

revision_symbol の正式用途（6章と統一）
- 版管理記号（A, B, C…）
- PDF 出力時の版表示
- 承認履歴との紐付け
- アーカイブ識別

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
※ DocumentBlock とは別物
※ Writer / TemplateEditor が扱うエディタ用 JSON
※ content JSON は Document テーブルに JSON として保存する（2章で統一）

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
- DocumentBlock は Editor の JSON とは別物
- 文書番号（sequence）は folder_id 単位でユニーク
- ApprovalRequest は文書につき 1 つ
- RevisionHistory は全量保存（差分保存はしない）


4. 文書番号（Document Number）仕様［最終統合版］
文書番号（management_number）は、文書を一意に識別し、
フォルダ階層 × 連番（sequence） × 改訂番号（revision） を体系的に管理するための識別子である。
本プロダクトでは、フォルダ階層に基づく prefix と、
folder_id 単位で採番される sequence、
改訂時に付与される revision を組み合わせた形式を採用する。

4.1 文書番号の構造
文書番号は以下の形式で構成される。
{FOLDER_CODE_HIERARCHY}-{SEQUENCE(3桁)}[-{REVISION(2桁)}]

例
- WI-001
- MANUAL-WI-015
- MANUAL-WI-015-02

4.2 フォルダコード階層（Folder.code）
Prisma モデル Folder は階層構造を持つ。
model Folder {
  id        Int
  code      String @unique
  parent_id Int?
}

文書番号の prefix は、
親 → 子フォルダの順に code を - で連結したもの。
例
MANUAL (code="MANUAL")
  └── WI (code="WI")

文書番号 prefix：
MANUAL-WI

4.3 連番（sequence）の仕様
Prisma モデル：
sequence Int?
@@unique([folder_id, sequence])

仕様
- sequence は folder_id 単位で採番
- 3 桁ゼロ埋め（001, 002, 003…）
- draft 状態では null
- submit API で正式に確定
- フォルダ内でユニーク
- トランザクションで採番すること（MAX + 1）

4.4 改訂番号（revision）の仕様
Prisma モデル：
revision Int @default(0)

仕様
- 初回作成時は revision = 0（文書番号には付与しない）
- 改訂時に revision を +1
- 文書番号には 2 桁ゼロ埋めで付与（01, 02…）
- prefix と sequence は改訂しても変わらない
- 状態遷移は 5章の仕様に従う

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
※文書番号の確定は 初回 submit のみ。
※改訂時は revision のみ増加し、prefix/sequence は不変。

4.6 文書番号の不変性（重要）
- submit 後は 文書番号は変更不可
- フォルダ移動しても文書番号は変わらない
- 文書種別を変更しても文書番号は変わらない
- 改訂時は revision のみ増加し、prefix と sequence は変わらない
- この不変性は監査性・法令遵守（ISO, GMP, J-SOX）に必須

4.7 連番変更（sequence override）仕様（draft 限定）
現場運用に対応するため、
draft 状態に限り sequence（連番）を手動で変更できる。
変更可能条件
- Document.status = "draft"
- folder_id が null でない
- sequence は 1〜999 の整数
- folder_id 単位で重複チェック必須
- 変更後は management_number を再生成
- revision は 0 のまま（改訂前）
変更不可条件
- checking / approving / approved
- rejected / revising
- revision > 0（改訂後）
目的
- PDF などの追加資料に合わせて番号を調整
- 過去文書の番号体系に合わせる
- 欠番を埋める
- 現場の柔軟な運用に対応
※sequence override の仕様は 4章を唯一の正 とし、5章では参照のみとする。

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

仕様上のポイント
- prefix は folder.code 階層で決定
- sequence は 3 桁ゼロ埋め
- revision は 2 桁ゼロ埋め
- revision = 0 の場合は suffix を付与しない
- prefix/sequence は改訂しても不変

4.9 文書番号の例（テキスト形式）
- フォルダ階層「WI」、sequence=1、revision=0
→ WI-001
- フォルダ階層「MANUAL → WI」、sequence=15、revision=0
→ MANUAL-WI-015
- フォルダ階層「MANUAL → WI」、sequence=15、revision=2
→ MANUAL-WI-015-02
- フォルダ階層「SAFETY → PROC → WI」、sequence=3、revision=1
→ SAFETY-PROC-WI-003-01

5. 承認フロー仕様［最終統合版］
承認フローは、文書の品質保証と統制を実現するための中心機能であり、
作成者 → チェッカー → アプローバー の順に進む 3 段階のワークフローで構成される。
承認フローは Document モデルと ApprovalRequest モデルを基盤とし、
文書の状態（Document.status）と承認要求（ApprovalRequest）が同期して動作する。

5.1 承認フローの全体像
承認フローは次のステップで構成される。
- 作成者が文書を作成し、draft 状態で保存
- 作成者が submit（承認申請）を行う
- チェッカーが確認し、承認または差戻しを行う
- アプローバーが最終承認を行う
- 文書は approved（正式文書）となる
承認フローは 文書 1 件につき ApprovalRequest は常に 1 件 で管理される。

5.2 文書ステータス（Document.status）
Document.status は以下の値を取る。
- draft
- checking
- approving
- approved
- rejected
- revising
各状態の意味
- draft：作成中。承認フロー未開始
- checking：チェッカーによる確認中
- approving：アプローバーによる最終承認中
- approved：正式文書
- rejected：チェッカーまたはアプローバーによる差戻し
- revising：改訂作業中（approved 文書の改訂）
※状態遷移は 5章の表を唯一の正 とし、3章・4章・9章はこれに従う。

5.3 ApprovalRequest の構造（Prisma 準拠）
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

仕様
- 文書 1 件につき ApprovalRequest は 1 件
- requester_id：作成者
- checker_id：確認者
- approver_id：承認者
- comment：差戻し理由など
- checked_at：チェッカーが処理した時刻

5.4 submit（承認申請）
submit は承認フローの開始点であり、次の処理を行う。
- 文書が draft 状態であることを確認
- folder_id が設定されていることを確認
- sequence を採番し、文書番号を生成（4章の仕様に従う）
- Document.status を checking に変更
- ApprovalRequest を作成
- RevisionHistory を作成（初版として revision=0 を保存）
submit 後は 文書番号は変更不可。

5.5 チェッカーの処理（check）
チェッカーは次の 2 種類の処理を行う。
1. 承認（approve to next stage）
- Document.status → approving
- ApprovalRequest.checked_at を更新
- comment があれば保存
2. 差戻し（reject）
- Document.status → rejected
- ApprovalRequest.comment に理由を保存
差戻し後、作成者は文書を修正し、再度 submit できる。

5.6 アプローバーの処理（approve）
アプローバーは最終承認を行う。
- Document.status → approved
- ApprovalRequest を完了状態として扱う
- RevisionHistory に正式版として記録
- 文書は正式文書となり、以後は改訂フローに入る

5.7 差戻し（reject）
reject はチェッカーまたはアプローバーが実行できる。
- Document.status → rejected
- ApprovalRequest.comment に差戻し理由を保存
- 作成者は修正後に再 submit できる
- sequence と management_number は再利用される（変更不可）

5.8 改訂（revise）
approved 文書は revise により改訂できる。
改訂フロー
- Document.status → revising
- 作成者が内容を修正
- submit により再度承認フローへ
- revision を +1
- 文書番号に revision を付与（例：01 → 02）
- RevisionHistory に改訂版を保存
※prefix と sequence は 変わらない（4章の不変性ルールに従う）

5.9 承認フローの不変ルール（4章と統一）
- 承認順序は 作成者 → チェッカー → アプローバー で固定
- Document.status と ApprovalRequest は常に同期
- submit 後は 文書番号を変更できない
- approved 文書は直接編集できない（revise のみ可能）
- ApprovalRequest は文書 1 件につき常に 1 件
- 改訂時は revision のみ増加し、sequence は変わらない
- 文書番号の詳細仕様は 4章に従う（唯一の正）

5.10 承認フローの例（テキスト形式）
- 作成者が文書を作成し、draft 状態で保存
- 作成者が submit を実行
- 文書番号が確定し、status が checking になる
- チェッカーが確認し、問題なければ approving に進める
- アプローバーが承認し、status が approved になる
- 文書は正式文書として固定される
- 改訂が必要になれば revise → submit → checking → approving → approved を繰り返す

5.11 ロール別の承認フロー権限（1章・11章と統一）
作成者（requester）
- role ∈ {creator, checker, approver, admin}
確認者（checker）
- role ∈ {checker, approver, admin}
承認者（approver）
- role ∈ {approver, admin}

5.12 ロール仕様の理由
- 上位ロールは下位ロールの作業を代行できる
- approver は checker の役割も兼ねられる
- admin は全ロールを代行可能
- user は閲覧のみ（作成不可）
- creator は作成・編集・提出が可能

5.13 ApprovalRequest の割り当てルール
checkerId の条件
- role ∈ {checker, approver, admin}
- disabled = false
- フォルダアクセス権（読み取り権限）がある
approverId の条件
- role ∈ {approver, admin}
- disabled = false
- フォルダアクセス権（読み取り権限）がある
requesterId の条件
- role ∈ {creator, checker, approver, admin}
- disabled = false

5.14 UI の選択制御（Writer / Submit モーダル）
チェッカー候補
- role ∈ {checker, approver, admin}
アプローバー候補
- role ∈ {approver, admin}
作成者（requester）
- ログインユーザー自身

5.15 不正割り当ての防止（API 側）
if (checker.role not in ["checker", "approver", "admin"]) {
  throw Error("Invalid checker role");
}

if (approver.role not in ["approver", "admin"]) {
  throw Error("Invalid approver role");
}

requester の条件
- requester はログインユーザー
- disabled = false

5.16 ロールと承認フローの関係（テキスト版）
- user：閲覧のみ
- creator：作成・編集・提出
- checker：確認
- approver：承認
- admin：すべて可能

5.17 まとめ（承認フローにおけるロール権限）
- requester（作成者）：creator / checker / approver / admin
- checker（確認者）：checker / approver / admin
- approver（承認者）：approver / admin

6. 改訂（Revision）と差分表示（Diff）仕様［最終統合版］
改訂は、正式文書（approved）に対して内容を更新するためのプロセスであり、
revision の増加・RevisionHistory の追加・差分表示（Diff） を中心に構成される。
改訂は文書の信頼性と追跡性を保証するための重要機能であり、
Document モデルと RevisionHistory モデルを基盤として動作する。
revision_symbol（A, B, C...）は企業向け文書管理における 版管理記号 であり、
PDF 出力時の版表示、承認履歴との紐付け、アーカイブ時の版識別に使用する。

6.1 改訂の基本ルール
- approved 文書のみ改訂できる
- 改訂開始時に Document.status を revising に変更
- 改訂中は文書を自由に編集できる
- submit により再度承認フローに入る（5章と統一）
- 承認されると revision が +1 される
- 文書番号は prefix と sequence を維持し、revision のみ増加する（4章と統一）
- 改訂前の内容は RevisionHistory に content 全量 として保存される

6.2 改訂時の revision の扱い
revision は整数で管理される。
- 初版（初回承認）は revision = 0
- 改訂 1 回目は revision = 1
- 改訂 2 回目は revision = 2
- 文書番号には 2 桁ゼロ埋めで付与（01, 02, 03…）
- prefix（フォルダ階層）と sequence（連番）は変わらない
例
- revision=0 → MANUAL-WI-015
- revision=1 → MANUAL-WI-015-01
- revision=2 → MANUAL-WI-015-02

6.3 RevisionHistory の保存内容
RevisionHistory は次の情報を保存する。
- document_id
- management_number（改訂時点の文書番号）
- revision_symbol（A, B, C…）
- title
- created_by_id（改訂作業者）
- checked_by_id（チェッカー）
- approved_by_id（アプローバー）
- created_at（改訂作成日時）
- content（Document.content の全量）
特に重要なのは content を全量保存すること。
差分表示はこの content を基準に行う。

6.4 差分表示（Diff）の目的
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
- 追加されたブロック
- 削除されたブロック
- 変更されたブロック
ブロックの同一性は id により判定する。

6.7 変更されたブロックの判定
id が一致し、いずれかのフィールドが異なる場合を「変更」と判定する。
比較対象フィールドは Block JSON Schema に基づく。
例
- テキスト内容（label）が変わった
- 位置（x, y）が変わった
- サイズ（width, height）が変わった
- 色（color）が変わった
- 図形の fillColor が変わった
- 画像の src が変わった
- テーブルの block.table.cells[row][col].text が変わった
- タイトルの value が変わった

6.8 差分表示の UI 仕様（テキスト形式）
- 追加されたブロック：緑色でハイライト
- 削除されたブロック：赤色でハイライト
- 変更されたブロック：黄色でハイライト
- テーブルはセル単位で変更箇所をハイライト
- タイトル・サブタイトルは value の変更をハイライト

6.9 差分アルゴリズム（正式仕様）
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
文書の 1ページ目の最上部 に表形式で自動生成されるブロックとして埋め込む。
目的
- 文書そのものに承認の証跡を残す
- PDF 出力時に承認履歴が必ず含まれる
- 紙文書運用との互換性を確保する
仕様
- Writer で文書を開いた際、1ページ目の最上部に承認履歴ブロックを自動生成
- source="system"、locked=true
- type="table"
- ApprovalHistory + RevisionHistory をもとに動的に構築
- ページ幅いっぱいに固定
- 高さは行数に応じて自動調整

6.13 改訂理由（Revision Comment）の扱い
改訂時には、作成者が 改訂理由（revision_comment） を入力できる。
仕様
- revise 開始時に改訂理由入力欄を表示
- 改訂理由は RevisionHistory.comment として保存
- 承認履歴表にも表示
- diff（内容差分）とは別に扱う
表示例
2026-03-01 09:15  revising   田中次郎  改訂理由：手順3の誤記修正

6.14 承認履歴ブロックの生成ルール
承認履歴ブロックは Document.content.blocks に次のように追加される。
- type="table"
- source="system"
- locked=true
- editable=false
- zIndex：最前面
- page=1 に固定配置
- x=0, y=0
- width：ページ幅
- height：行数に応じて自動計算
再生成タイミング
- submit
- check
- approve
- reject
- revise（改訂開始）
- 改訂版が approved になった時
再生成方法
- 既存の承認履歴ブロックを削除
- 最新の ApprovalHistory + RevisionHistory をもとに新しい表ブロックを生成
- Document.content.blocks の先頭に挿入

6.15 承認履歴と差分表示の関係
- 承認履歴：誰が何をしたか（メタ情報）
- 差分表示：文書のどこが変わったか（技術情報）
両者は次のように連携する。
- チェッカーは承認履歴表で「誰が何をしたか」を確認
- 同時に差分表示で「どこが変わったか」を確認
- アプローバーも両方を参照して承認判断を行う

6.16 承認履歴の永続化
承認履歴は次の 2 つの場所に保存される。
1. ApprovalHistory（DB）
- 永続的な履歴
- 誰が・いつ・何をしたか
- コメント（差戻し理由・改訂理由）
2. Document.content.blocks（1ページ目の表）
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

7. AI 統合仕様（検索・生成・改訂・改善ループ）
AI は文書管理システムの中心機能であり、
文書生成 → 構造化 → 検索 → 改訂 → 承認 → 改訂履歴 → ISO対応 → 改善ループ
という一連のライフサイクルを支える。
AI は以下の 4 つの領域で機能する。
- AI検索（装置特定 × 段落検索 × 意味検索）
- AI生成（要約・比較・統合・改善案）
- AI改訂（意味差分 × 段落単位の改訂案）
- AI整合性チェック（文書ネットワークの問題検出）
これらは 7章の検索仕様と連動し、文書の改善ループを形成する。

7.1 AI ドキュメントライフサイクル（改善ループ）
AI は文書の一生を以下の流れで支援する。
- 文書生成（AI Writer）
文書種別（標準書・手順書・チェックシート）に応じた構造で生成。
- 文書構造化
content.blocks / metadata / hierarchy / revision により構造化。
- AI検索（RAG）
装置管理番号・型式・メーカー・工程・文書種別で絞り込み、
段落 embedding による意味検索を実行。
- AI改訂案生成
改訂前後の差分を意味解析し、段落単位で改訂案を生成。
- AI整合性チェック（問題パネル）
文書間リンク・階層・装置情報をもとに不整合を検出。
- 承認フロー
AI提案は必ず人間が承認し、ISO要件を満たす。
- 改訂履歴
すべての改訂は revisionHistory に記録され、追跡可能。
このループにより、文書は継続的に改善され、ISO・GMP・品質管理に対応する。

7.2 AI検索（装置特定 × 段落検索 × 意味検索）
AI検索は以下の3層で構成される。
1. メタデータフィルタ
検索対象を装置単位で特定する。
- メーカー（maker）
- 型式（model）
- 装置管理番号（assetId）
- 工程（process）
- 文書種別（document_type）
- 重要度（importance）
これにより、似た装置の誤ヒットを防ぐ。
2. 段落 embedding 検索
DocumentParagraph（段落ID）単位で embedding を保持し、
意味検索を行う。
返却値：
- documentId
- paragraphId
- score
- snippet
3. LLM による最終フィルタ
装置情報と文書内容の整合性を LLM がチェックし、
誤ヒットを除外する。

7.3 AI生成（検索上位 N 件を使用）
AI生成は検索結果の 上位 N 件（3〜5件） のみを LLM に渡して行う。
生成可能な内容：
- 文書の要約
- 文書の比較
- 文書の統合案
- 文書の改善案
- 文書の差分説明
- 文書の引用付き回答
重要仕様：
- 全データを渡さない（偽データ混入防止）
- 会話リセットでコンテキストを初期化
- アクセス権を尊重（閲覧不可文書は渡さない）

7.4 AI改訂（意味差分 × 段落単位）
AIは文書の改訂前後の差分を解析し、
以下を自動で行う。
- 差分の意味分類（工程変更・安全基準変更など）
- 影響範囲の特定（文書ネットワーク）
- 該当段落の抽出
- 段落単位の改訂案生成
改訂案は AIチャット欄に表示し、
ユーザーがエディタで修正する。

7.5 AI整合性チェック（文書ネットワークの問題検出）
VSCode の「問題」パネルと同様の仕組み。
AIは以下の不整合を検出する。
- 上位文書と下位文書の矛盾
- 装置変更に追従していない段落
- 工程番号の不一致
- 安全基準の旧版使用
- 類似文書との内容差異
- 文書間リンクの破損
問題は DocumentIssue として保存される。
項目：
- severity（error / warning / info）
- message
- documentId
- paragraphId
- createdAt
ユーザーは問題をクリックすると該当段落へジャンプできる。

7.6 AIインデックス（RAG）仕様
※あなたが提示した内容を維持しつつ、AI全体仕様と整合させた最終版。
インデックス対象
- fullText のみ
対象外
- blocks のテキスト
- RevisionHistory
- メタ情報
目的
- 意味検索
- 類似文書検索
- AI生成の基盤
更新タイミング
- 文書作成
- 文書更新
- 改訂
- 承認

7.7 アクセス権とAI
AI検索・AI生成・AI改訂はすべて user_folder_access を尊重する。
- canRead = true の文書のみ検索対象
- AI生成に渡す文書も同様
- admin は全件アクセス可能

7.8 検索 → プレビュー → AI生成の流れ
- ユーザーがキーワードを入力
- メタデータ検索・全文検索・AI検索を統合
- 文書番号を提示しプレビュー
- 上位 N 件を LLM に渡して AI生成
- 必要に応じて会話リセット


8. テンプレート・Writer エディタ仕様［最終統合版］
テンプレートエディタ（TemplateEditor）および文書エディタ（Writer）は、
Document.content（blocks） を編集するための UI とロジックを提供する。
両者は同じ Block JSON Schema を共有し、
テンプレート → 文書 の継承を前提に動作する。

8.1 エディタの基本構造
エディタは次の 3 層で構成される。
- 表示レイヤー（Canvas / BlockRenderer）
- 編集レイヤー（useBlockActions / useSelection / useTransform）
- 永続化レイヤー（Document.content / Template.content）
すべての編集操作は blocks（Block JSON Schema）を直接操作する。

8.2 ページ管理仕様
文書は複数ページを持つことができる。
- page は 1 から始まる整数
- 各ページは独立した blocks 配列を持つ
- ページ追加・削除・並び替えが可能
- 1ページ目には承認履歴ブロックが自動挿入される（6章と統一）
- ページ削除は 1ページ目を除き可能
- ページ切り替え時は blocks を切り替えて描画する

8.3 ブロック構造（Block JSON Schema）
エディタが扱うすべてのブロックは、
6章で定義した Block JSON Schema に完全準拠する。
ブロックの種類
- text
- rect / circle / triangle / arrow / line
- image
- table
- titlePlaceholder
- subtitlePlaceholder
- system（承認履歴用）

8.4 テンプレート（Template）仕様
テンプレートは文書の初期構造を定義する。
テンプレートの特徴
- content は Document.content と同じ構造
- ブロックに source="template" が付与される
- locked=true のブロックは文書側で編集不可
- テンプレートの更新は既存文書には影響しない
- created_by（作成者）が記録される
テンプレート → 文書の継承
- blocks を深いコピーで複製
- source="template" のまま継承
- editable=false のブロックは内容編集不可
- locked=true のブロックは完全編集不可

8.5 文書エディタ（Writer）仕様
Writer は Document.content を編集する UI であり、次の機能を持つ。
- ブロックの追加・削除
- ブロックの移動・拡大縮小・回転
- テキスト編集
- 画像挿入
- 表のセル編集
- ページ追加・削除
- 承認履歴ブロックの自動挿入（6章と統一）
- draft 保存
- submit（承認申請）

8.6 ブロックのロック機構
ブロックには次のロック属性がある。
- locked=true → 位置・サイズ・内容すべて編集不可
- editable=false → 内容のみ編集不可（位置は編集可）
- source="template" → テンプレート由来のブロック
- source="system" → 承認履歴ブロック（完全ロック）
Writer の編集ルール
- locked=true のブロックは選択不可
- editable=false のブロックは内容編集不可
- system ブロックは削除不可
- template ブロックは削除不可（editable=true の場合は内容編集可）

8.7 承認履歴ブロックの自動生成
承認履歴は 1ページ目に自動生成される。
仕様
- type="table"
- source="system"
- locked=true
- editable=false
- x=0, y=0 に固定
- ページ幅いっぱいに配置
- ApprovalHistory + RevisionHistory をもとに動的生成
- submit / check / approve / reject / revise のたびに再生成
※6章の仕様と完全一致。

8.8 編集操作（Transform）仕様
ブロックの編集操作は次の通り。
- ドラッグで移動
- ハンドルで拡大縮小
- 回転ハンドルで rotate を変更
- Shift で比率固定
- Ctrl で複製
- Delete で削除（削除不可ブロックは除く）

8.9 選択仕様（Selection）
選択は次のルールに従う。
- クリックで単一選択
- Shift+クリックで複数選択
- ドラッグ範囲選択が可能
- 選択中のブロックはハイライト表示
- locked ブロックは選択不可

8.10 編集履歴（Undo / Redo）
Writer は編集履歴を保持する。
- Undo / Redo が可能
- 履歴は blocks の差分で管理
- submit 時に履歴はクリアされる

8.11 PDF 出力仕様
PDF 出力は Document.content をもとに行う。
仕様
- 1ページ目に承認履歴が必ず含まれる（6章と統一）
- ブロックの位置・サイズ・色を忠実に再現
- 画像は埋め込み
- 表はセル単位で描画
- ページサイズは paper（A4 / A3）に従う
- orientation（portrait / landscape）に従う

8.12 テンプレートと文書の関係
テンプレート → 文書の継承ルール：
- テンプレートの blocks をコピーして文書を生成
- source="template" のブロックは文書側で保持
- locked=true のブロックは編集不可
- 文書側で追加したブロックは source="user"
- 文書側で削除不可のブロックは template 由来

8.13 エディタの非機能要件
- ブロック構造は後方互換性を維持
- Document.content の JSON Schema は絶対に変更しない
- テンプレート更新は既存文書に影響しない
- 承認履歴ブロックは常に最優先で描画
- PDF 出力は UI と同一レイアウトを保証
- エディタは 60fps を目標に描画

8.14 エディタの例（テキスト形式）
- テンプレートを選択して文書を作成
- テンプレート由来のブロックが配置される
- ユーザーがテキストや図形を追加
- draft 保存
- submit すると承認履歴ブロックが生成される
- チェッカー・アプローバーが承認
- approved 文書は PDF 出力可能
- revise すると再び編集可能になり、承認履歴が更新される


9. API 仕様（入出力 DTO の固定化）［最終統合版］
API は、フロントエンド（Writer / TemplateEditor / DocumentList / Search / AI）と
バックエンド（Prisma / DB）を結ぶ 唯一のインターフェース である。
目的は、DTO（Data Transfer Object）を固定化し、AI が勝手に構造を変えないようにすること。
すべての API は JSON ベースの REST API とし、
入出力 DTO はこの章で定義した構造から変更してはならない。
Document.content は JSON として Document テーブルに保存する。
Prisma の DocumentBlock モデルは使用しない（将来的に削除予定）。

9.1 共通仕様
- すべての API は JSON を返す
- DTO の構造は固定（フィールド名の変更禁止）
- 追加フィールドは許可するが、削除・名称変更は不可
- Document.content は Block JSON Schema に完全準拠
- Document.fullText はサーバー側で自動生成
- management_number は submit 時に生成
- sequence は submit 時に採番
- revision は改訂時に +1

9.2 Document API

9.2.1 GET /documents/{id}
文書の詳細を取得する。
レスポンス DTO
{
  "id": 123,
  "title": "文書タイトル",
  "status": "draft",
  "management_number": "MANUAL-WI-015-02",
  "sequence": 15,
  "revision": 2,
  "folder_id": 3,
  "document_type_id": 1,
  "creator": {
    "id": 5,
    "name": "山田太郎"
  },
  "content": {
    "pages": [
      {
        "page": 1,
        "blocks": [ /* Block[] */ ]
      }
    ]
  },
  "approvalRequest": {
    "requester": UserSummary,
    "checker": UserSummary,
    "approver": UserSummary,
    "comment": "差戻し理由",
    "requested_at": "2026-02-26T10:12:00Z"
  },
  "approvalHistory": ApprovalHistoryEntry[],
  "revisionHistory": RevisionHistoryEntry[]
}

9.2.2 POST /documents
文書を新規作成する。
リクエスト DTO
{
  "title": "新規文書",
  "folder_id": 3,
  "document_type_id": 1,
  "content": DocumentContent
}

レスポンス DTO
{ "id": 123 }

9.2.3 PUT /documents/{id}
draft の文書を更新する。
リクエスト DTO
{
  "title": "更新後タイトル",
  "folder_id": 3,
  "document_type_id": 1,
  "content": DocumentContent
}

レスポンス DTO
{ "success": true }

9.3 Submit（承認申請）API

9.3.1 POST /documents/{id}/submit
承認申請を行う。
リクエスト DTO
{
  "checker_id": 10,
  "approver_id": 12
}

レスポンス DTO
{
  "management_number": "MANUAL-WI-015",
  "sequence": 15,
  "revision": 0
}

submit 時の処理
- sequence を採番
- management_number を生成（4章の仕様）
- status → checking
- ApprovalRequest を作成
- RevisionHistory（初版）を作成
- 承認履歴ブロックを生成（6章と統一）

9.4 承認フロー API

9.4.1 POST /documents/{id}/check
チェッカーが確認する。
リクエスト DTO
{ "comment": "確認しました" }

レスポンス DTO
{ "status": "approving" }

9.4.2 POST /documents/{id}/approve
アプローバーが承認する。
リクエスト DTO
{ "comment": "承認します" }

レスポンス DTO
{
  "status": "approved",
  "revision": 1
}

9.4.3 POST /documents/{id}/reject
差戻し。
リクエスト DTO
{ "comment": "修正してください" }

レスポンス DTO
{ "status": "rejected" }

9.5 改訂（revise）API

9.5.1 POST /documents/{id}/revise
改訂を開始する。
リクエスト DTO
{ "reason": "手順3の誤記修正" }

レスポンス DTO
{ "status": "revising" }

改訂開始時の処理
- status → revising
- 改訂理由を RevisionHistory に保存
- 承認履歴ブロックを再生成

9.6 検索 API

9.6.1 POST /search
検索を行う。
リクエスト DTO
{
  "keyword": "検査",
  "folderId": 3,
  "documentType": "WI",
  "status": ["approved"],
  "useAI": true
}

レスポンス DTO
{
  "results": [
    {
      "id": 123,
      "title": "検査手順書",
      "management_number": "MANUAL-WI-015-02",
      "snippet": "…検査工程において…",
      "score": 0.82
    }
  ]
}

9.7 AI 生成 API（RAG）

9.7.1 POST /ai/generate
検索上位 N 件をもとに AI 生成を行う。
リクエスト DTO
{
  "keyword": "改善案",
  "topN": 3
}

レスポンス DTO
{
  "output": "改善案の提案内容…",
  "sources": [
    {
      "management_number": "MANUAL-WI-015-02",
      "title": "検査手順書"
    }
  ]
}

仕様
- AI に渡すのは検索上位 N 件のみ
- 会話リセット時は再ロード（7章と統一）

9.8 会話リセット API

9.8.1 POST /ai/reset
AI のコンテキストをリセットする。
レスポンス DTO
{ "success": true }

9.9 テンプレート API

9.9.1 GET /templates
テンプレート一覧を取得。
9.9.2 POST /templates
テンプレートを作成。
9.9.3 PUT /templates/{id}
テンプレートを更新。
content は Document.content と同じ構造。

9.10 DTO の不変性ルール（最終統合版）
- DTO のフィールド名は変更不可
- 削除不可
- 型変更不可
- 追加は許可（後方互換性のため）
- Document.content は Block JSON Schema に完全準拠
- management_number は API で生成し、クライアントは変更不可
- sequence / revision の扱いは 4章の仕様に従う
- approvalRequest / approvalHistory / revisionHistory の構造は固定


10. エラーハンドリング・バリデーション仕様
エラーハンドリングは、API の信頼性・一貫性・安全性を保証するための基盤であり、
すべての API は 統一されたエラー構造 と 厳密なバリデーション を持つ。
この章では、
- エラー形式
- バリデーションルール
- 承認フロー固有のエラー
- 文書番号生成のエラー
- 改訂のエラー
- 検索のエラー
- エディタのエラー
を体系的に定義する。

10.1 エラー形式（統一仕様）
すべての API は次の形式でエラーを返す。
{
  "error": {
    "code": string,
    "message": string,
    "details": any | null
  }
}


code の例
- INVALID_INPUT
- NOT_FOUND
- PERMISSION_DENIED
- VALIDATION_FAILED
- CONFLICT
- SERVER_ERROR
- WORKFLOW_VIOLATION
- SEQUENCE_DUPLICATE
- REVISION_NOT_ALLOWED
message の原則
- 人間が読んで理解できる文章
- 技術的すぎる内容は禁止
- 内部エラー内容（SQL など）は絶対に漏らさない

10.2 バリデーションの基本ルール
すべての API は次のバリデーションを行う。
- 必須フィールドの存在チェック
- 型チェック（string / number / boolean / array）
- ID の存在チェック（DB に存在するか）
- アクセス権チェック（user_folder_access）
- ステータスチェック（draft / checking / approved など）
- 文書番号の一意性チェック
- sequence の重複チェック
- content（Block JSON Schema）の構造チェック

10.3 文書番号（management_number）関連のエラー
sequence 採番時のエラー
- 同じ folder_id に同じ sequence が存在する場合
→ code: SEQUENCE_DUPLICATE
文書番号生成時のエラー
- folder.code が存在しない
- folder の階層が壊れている
- sequence が null のまま submit された
文書番号変更禁止エラー
submit 後に sequence を変更しようとした場合：
code: WORKFLOW_VIOLATION
message: "文書番号は承認申請後に変更できません。"

10.4 承認フローのエラー
承認フローは厳密な状態遷移を持つため、
不正な操作はすべてエラーとする。
submit のエラー
- status が draft 以外
- checker_id が不正（role が checker/approver/admin 以外）
- approver_id が不正（role が approver/admin 以外）
- folder_id が null
- content が空
check のエラー
- status が checking 以外
- チェッカーが approver でない場合（role 不一致）
approve のエラー
- status が approving 以外
- approver の role が不正
reject のエラー
- comment が空
- status が checking / approving 以外

10.5 改訂（revise）のエラー
改訂開始時のエラー
- status が approved 以外
- 改訂理由（reason）が空
- 文書番号が不正
改訂中の編集エラー
- system ブロックを編集しようとした
- template ブロックを削除しようとした
改訂後の submit エラー
- revision が null
- content が空
- sequence が null（初版のときのみ）

10.6 エディタ（Writer / TemplateEditor）のエラー
ブロック編集エラー
- Block JSON Schema に違反
- type が不正
- id が重複
- locked=true のブロックを編集
- source="system" のブロックを削除
- table のセル構造が壊れている
ページ管理エラー
- 1ページ目を削除しようとした
- page 番号が不正
- ページ数が上限を超えた

10.7 検索のエラー
keyword が不正
- 文字数が 0 かつフィルタもない
- 文字数が極端に長い（1000文字以上）
AI 検索のエラー
- useAI=true だが AI インデックスが未生成
- topN が 0 または負数
- topN が上限（例：10）を超える

10.8 AI 生成のエラー
入力エラー
- keyword が空
- topN が不正
- 検索結果が 0 件
偽データ対策エラー
- 会話リセット前の古いコンテキストを参照しようとした
- 存在しない管理番号を参照した

10.9 テンプレートのエラー
テンプレート作成エラー
- name が空
- content が空
- Block JSON Schema に違反
テンプレート更新エラー
- template ブロックの構造が壊れている
- 既存文書に影響する変更は禁止（content の構造変更など）

10.10 エラーのログ出力
サーバー側では次の情報をログに残す。
- error.code
- error.message
- user_id
- document_id（あれば）
- API パス
- リクエスト内容（個人情報を除く）
ただし、ログは外部に公開しない。

10.11 エラーのユーザー表示ルール
ユーザーに表示するメッセージは次の原則に従う。
- 技術的すぎる内容は禁止
- SQL エラーや内部エラーは隠す
- 「何が原因で」「どうすれば直るか」を明確に伝える
- 文書番号・承認フロー・改訂に関するエラーは特に丁寧に説明する

11. セキュリティ・アクセス権・権限モデル（完全統合版）
本システムは企業向け文書管理・承認ワークフローとして、
認証・権限・フォルダACL・文書アクセス制御・公開範囲・AI利用制御・データ保護・監査ログ
を統合したセキュリティモデルを採用する。
セキュリティは次の 6 層で構成される。
- 認証（Authentication）
- 権限（Role-based Authorization）
- フォルダアクセス権（Folder ACL）
- 文書アクセス権（Document Access Control）
- 公開範囲（Document Visibility Scope）
- データ保護・AI 利用制御・監査ログ

11.1 認証（Authentication）
- メールアドレス + パスワード
- パスワードは bcrypt でハッシュ化
- PasswordResetToken によるワンタイムリセット
- disabled=true のアカウントはログイン不可
- lastLogin を更新
- 将来的に SSO（SAML / Azure AD）を追加可能

11.2 権限モデル（Role-based Authorization）
User.role は次の 5 種類。
- user
- creator
- checker
- approver
- admin
ロールの正式定義（1.2章・5.16章と完全統一）
- user：閲覧のみ可能（読み取り専用）。作成不可。
- creator：文書の作成・編集・submit が可能。
- checker：文書の確認（check）が可能。
- approver：文書の承認（approve）が可能。
- admin：すべての操作が可能。
承認フローにおける役割（5章と完全同期）
- requester（作成者）：creator / checker / approver / admin
- checker（確認者）：checker / approver / admin
- approver（承認者）：approver / admin

11.3 フォルダアクセス権（Folder ACL）
user_folder_access によりフォルダ単位でアクセス権を管理する。
- canRead：閲覧可能
- canWrite：編集可能（draft / revising のみ）
- userId × folderId はユニーク
- admin はすべてのフォルダにアクセス可能
role と ACL の関係（15.3章との重複を統合）
- role は「何ができるか」（作成・承認などの機能権限）
- ACL は「どのフォルダに対してできるか」（対象範囲の制御）
- 実際のアクセス可否は role と ACL の両方を満たす必要がある
- この原則は 15章の実装詳細でも共通とする

11.4 文書アクセス権（Document Access Control）
文書のアクセス権は次のルールで決まる。
- 文書の folder_id に対する ACL が基準
- canRead=true → 文書閲覧可能
- canWrite=true → 文書編集可能（draft / revising のみ）
- approved 文書は編集不可（revise のみ）
- 承認フロー中は作成者も編集不可
- admin はすべての文書を閲覧・編集可能

11.5 公開範囲（Document Visibility Scope）
文書には 公開範囲（visibility_scope） を設定できる。
公開範囲の目的
- 文書ごとに「誰が閲覧できるか」を細かく制御
- 機密文書・部門限定文書・プロジェクト限定文書に対応
公開範囲の例
- 全社公開
- 部門限定（department_id）
- セクション限定（section_id）
- 特定ユーザー限定（userId のリスト）
- 特定フォルダ ACL のみ
公開範囲と ACL の関係（重要）
- ACL と visibility_scope の両方を満たす必要がある
- どちらか一方が拒否すれば閲覧不可
- 企業向けの厳密なアクセス制御を実現

11.6 AI 利用におけるセキュリティ
AI はデータを学習用に使用しない（企業向け要件）
- AI に渡すデータは 推論（inference）専用
- 学習（training）には一切使用しない
- データは外部に送信しない（オンプレ / プライベート環境前提）
- AI はユーザーの権限を超えた文書を参照できない
AI に渡すデータの制限（7章と統一）
- 検索上位 N 件のみ
- fullText / snippet のみ（必要に応じて）
- 文書全文を無制限に渡すことは禁止
- 管理番号（management_number）を必ず明示して引用

11.7 データ保護（Data Protection）
文書ハッシュ化（改ざん検知）
- Document.content を SHA-256 などでハッシュ化
- Document.hash として保存
- 改訂時は新しいハッシュを生成
- RevisionHistory にもハッシュを保存
- 改ざん検知に使用
その他のデータ保護
- パスワードは平文保存禁止
- RevisionHistory は更新禁止（insert のみ）
- 文書削除は論理削除
- 添付ファイルはストレージに保存し、DB にはパスのみ保存

11.8 監査ログ（Audit Log）
記録対象
- ログイン / ログアウト
- 文書作成・更新
- submit / check / approve / reject / revise
- テンプレート作成・更新
- ACL 変更
- visibility_scope の変更
ログ内容
- user_id
- action
- document_id（あれば）
- timestamp
- IP アドレス
- 成功 / 失敗
監査ログは 5年以上保持。

11.9 改ざん防止（Integrity）
- RevisionHistory は更新禁止
- 承認履歴ブロックは source="system" で locked=true
- management_number は submit 後に変更不可
- sequence は submit 後に変更不可
- approved 文書は直接編集不可（revise のみ）
- Document.hash により改ざん検知可能

11.10 企業向け非機能要件
- すべての API は認証必須
- すべての API は権限チェック必須
- すべての API は ACL と visibility_scope を尊重
- AI は権限を超えた文書を参照しない
- content の JSON Schema は後方互換性を維持
- PDF 出力は承認履歴を必ず含む
- 文書は 10 年以上保持（法令対応）

11.11 文書保持・アーカイブ・通知ポリシー（14章と役割分離済）
※アーカイブの詳細仕様（保持データ・保持期間・移行ルール）は 14章に統合。
11章では「運用ポリシーと通知」に限定する。
11.11.1 文書保持の基本方針
- 過去文書はすべて保持（削除は原則禁止、論理削除のみ）
- 企業側にもダウンロード保持を推奨
- 法令遵守・監査対応・リスク分散のため
11.11.2 アーカイブ（Archive）機能の概要
- アーカイブ文書は検索対象外
- content（blocks）は保持しない
- PDF / ハッシュ / 承認履歴のみ保持
- 閲覧のみ可能
- アーカイブ解除は管理者のみ
11.11.3 アーカイブ移行の通知
通知対象：
- requester
- checker
- approver
- admin
通知内容：
- 文書番号
- タイトル
- 改訂番号
- アーカイブ予定日
- ダウンロード推奨
- アーカイブ後の制限
11.11.4 アーカイブ移行のタイミング
企業ごとに設定可能（例：5年 / 10年 / 15年 / 無期限）。
11.11.5 原文保持とアーカイブ保持の違い
- 原文保持：content を保持、検索可能、revise 可能
- アーカイブ保持：content 破棄、PDF/ハッシュのみ、検索不可、閲覧のみ
11.11.6 ハッシュ化による改ざん検知
- Document.hash を保持
- RevisionHistory にもハッシュを保存
- content を破棄しても改ざん検知可能
11.11.7 AI 利用とアーカイブの関係
- アーカイブ文書は AI 検索・AI 生成の対象外
- AI インデックスにも含めない


12. パフォーマンス・スケーラビリティ・運用仕様（完全統合版）
本章では、企業向け文書管理システムとして必要な
高速性・安定性・拡張性・バックアップ・アーカイブ運用・AI 負荷管理 に加え、
Writer の 自動保存（クラッシュ耐性） と アーカイブ移行履歴の保持 を含めた運用仕様を定義する。

12.1 Writer の自動保存（クラッシュ耐性）
企業向け運用では、長時間編集・ブラウザクラッシュ・通信断に耐える設計が必須である。
自動保存の基本仕様
- 編集中の文書は 5〜10秒ごとに自動保存
- 保存先は サーバー側の draft 保存 API
- 保存は 差分ベース（blocks の変更部分のみ送信）
- 保存失敗時は localStorage にバックアップ
- 復元時は サーバー版とローカル版を比較し、新しい方を採用
自動保存の目的
- ブラウザクラッシュ時のデータ消失防止
- ネットワーク不安定環境での編集継続
- 長時間編集時の安全性向上
自動保存のトリガー
- タイマー（5〜10秒）
- ブロック編集時
- ページ移動時
- フォーカス喪失時（blur）
復元フロー
- Writer 起動時に「未保存データがあります」ダイアログを表示
- サーバーの draft とローカルバックアップを比較
- 新しい方を採用
- 復元後は自動保存を再開
自動保存と承認フローの関係
- draft / revising のみ自動保存対象
- checking / approving / approved は自動保存しない
- revise 開始後は再び自動保存が有効

12.2 アーカイブ移行履歴（Archive History）
アーカイブは文書の長期保存とパフォーマンス最適化のために重要であり、
企業向け要件として アーカイブ移行履歴を必ず保持する。
※アーカイブの保持データ・保持期間・移行ルールは 14章に統合。
アーカイブ移行履歴の目的
- 監査対応
- コンプライアンス（ISO, FDA, GMP, J-SOX）
- 文書のライフサイクル追跡
アーカイブ移行履歴に保存する情報
- document_id
- 移行日時
- 移行理由（保持期間満了 / 管理者操作）
- 移行前の revision
- 移行前の management_number
- 移行時のハッシュ値
- 操作ユーザー（自動 or 管理者）
アーカイブ移行履歴の特徴
- 更新不可（append-only）
- 削除不可
- 監査ログとは別に保持
- 文書のライフサイクルを完全に追跡可能

12.3 アーカイブ移行時の通知（メール）
アーカイブ移行前に、次のユーザーへメール通知する。
通知対象
- 作成者（requester）
- 確認者（checker）
- 承認者（approver）
- 管理者（admin）
通知内容
- 文書番号
- タイトル
- 改訂番号
- アーカイブ予定日
- ダウンロード保持の推奨
- アーカイブ後の制限（検索不可・編集不可など）

12.4 アーカイブのパフォーマンス効果
アーカイブはパフォーマンス最適化にも寄与する。
効果
- アクティブ文書から除外 → 検索高速化
- AI インデックスから除外 → AI 検索高速化
- content（blocks）を保持しない → DB 容量削減
- RevisionHistory のみ保持 → 監査性維持

12.5 自動保存とアーカイブの連携
- 自動保存は draft / revising のみ
- approved 文書は自動保存しない
- アーカイブ移行後は編集不可のため自動保存も無効
- アーカイブ移行履歴は自動保存とは独立して保持

12.6 バックアップ仕様（自動保存との整合）
バックアップ対象
- Document（content, fullText, hash）
- RevisionHistory
- ApprovalHistory
- ArchiveHistory（アーカイブ移行履歴）
- user_folder_access
- テンプレート
- AI インデックス
バックアップ頻度
- 毎日フルバックアップ
- 1時間ごと差分バックアップ
企業側にも ダウンロード保持を推奨。

12.7 障害対応（Writer 自動保存を含む）
Writer 障害時
- 自動保存が失敗した場合はローカルに保存
- 復元時にサーバー版とローカル版を比較
- どちらも壊れている場合は RevisionHistory から復元
API 障害時
- タイムアウト 5 秒
- リトライ 1 回
- エラーログを記録し管理者に通知
AI 障害時
- AI 機能は degrade モード（全文検索のみ）で継続

12.8 企業向け運用のまとめ
- Writer は自動保存でクラッシュ耐性を確保
- 自動保存はサーバーとローカルの二重構造
- アーカイブ移行履歴を保持し、監査性を保証
- アーカイブは検索・AI の対象外でパフォーマンス向上
- 原文保持期間・アーカイブ保持期間は企業ごとに設定可能
- 企業側にもダウンロード保持を推奨
- AI は学習にデータを使用しない
- すべての文書はハッシュ化し改ざん検知可能


13. ログ・監査・可観測性仕様（完全統合版）
企業向け文書管理システムでは、
すべての操作が追跡可能であり、改ざんされず、監査に耐え、障害時に原因を特定できること
が必須である。
本章では、以下の 5 つを統合したログ・監査・可観測性モデルを定義する。
- 操作ログ（Operation Log）
- 監査ログ（Audit Log）
- アーカイブ移行ログ（Archive History）
- AI 利用ログ（AI Usage Log）
- 可観測性（メトリクス / トレース / アラート）
すべてのログは append-only（追記のみ） とし、削除・改変は禁止。

13.1 ログの基本方針
ログは次の 3 種類に分類される。
- 操作ログ（Operation Log）
ユーザーが行った操作を記録する。
- 監査ログ（Audit Log）
コンプライアンス・法令対応のための厳密な証跡。
- システムログ（System Log）
障害解析・パフォーマンス監視用。
共通ルール：
- すべて append-only
- 削除不可
- 改ざん不可（監査ログはハッシュ化）
- 保持期間は 14章の保持ポリシーに従う

13.2 操作ログ（Operation Log）
ユーザーが行ったすべての重要操作を記録する。
記録対象
- ログイン / ログアウト
- 文書作成
- 文書更新（draft 保存・自動保存含む）
- submit（承認申請）
- check（確認）
- approve（承認）
- reject（差戻し）
- revise（改訂開始）
- テンプレート作成・更新
- フォルダアクセス権の変更
- visibility_scope の変更
- アーカイブ移行
- アーカイブ解除
記録内容
- user_id
- action
- document_id（あれば）
- timestamp
- IP アドレス
- 成功 / 失敗
- 変更内容（差分）

13.3 監査ログ（Audit Log）
監査ログは、企業のコンプライアンス（ISO, FDA, GMP, J-SOX）に対応するための証跡。
特徴
- 操作ログより厳密
- 改ざん不可（ハッシュ化して保存）
- 5〜10年保持（企業設定）
- アーカイブ移行履歴も含む
- 14章の保持ポリシーに従う
監査ログに含める情報
- 文書番号（management_number）
- 改訂番号（revision）
- 承認履歴（requested / checked / approved / rejected）
- 改訂理由（revision_comment）
- アーカイブ移行履歴
- 文書ハッシュ（改ざん検知用）

13.4 アーカイブ移行ログ（Archive History）
12章で定義したアーカイブ機能に対応し、
アーカイブ移行時の履歴を必ず記録する。
記録内容
- document_id
- management_number
- revision
- 移行日時
- 移行理由（保持期間満了 / 管理者操作）
- 操作ユーザー（自動 or 管理者）
- 文書ハッシュ
- アーカイブ後の保持期限
特徴
- append-only
- 削除不可
- 検索対象外（監査用のみ）
- 監査ログにも連携

13.5 AI 利用ログ（AI Usage Log）
AI の利用は企業向けでは特に監査が必要。
記録対象
- AI 検索
- AI 生成
- 会話リセット
- 参照した文書番号（management_number）
- topN の値
- AI に渡したデータ量（fullText の文字数など）
記録内容
- user_id
- action（ai_search / ai_generate / ai_reset）
- timestamp
- 使用した文書番号の一覧
- AI 出力のハッシュ（内容そのものは保存しない）
特徴
- AI がどの文書を参照したかを完全に追跡可能
- AI 出力は保存しない（セキュリティのため）
- 監査ログにも連携可能
- 7章の AI インデックス仕様と整合

13.6 システムログ（System Log）
システムログは障害解析・パフォーマンス監視のために使用する。
記録対象
- API エラー
- DB エラー
- タイムアウト
- AI 推論エラー
- 自動保存失敗
- バックアップ失敗
- アーカイブ移行失敗
記録内容
- timestamp
- error_code
- message
- stacktrace（内部のみ）
- server_id
- request_id
特徴
- 外部公開禁止
- 管理者のみ閲覧可能

13.7 可観測性（Observability）
可観測性は次の 3 要素で構成される。

1. メトリクス（Metrics）
監視対象：
- API レスポンス時間
- DB クエリ時間
- AI 推論時間
- 自動保存成功率
- アーカイブ移行成功率
- エディタのエラー率
- 検索クエリ数
- CPU / メモリ / IOPS

2. トレース（Tracing）
- 各 API リクエストに request_id を付与
- submit → check → approve の一連の流れを追跡可能
- AI 生成の処理経路も追跡可能
- 障害発生時の原因特定に使用

3. アラート（Alerting）
アラート条件：
- API エラー率が一定以上
- AI 推論が遅延
- 自動保存が連続失敗
- バックアップ失敗
- アーカイブ移行失敗
- DB 負荷が閾値超過
通知先：
- 管理者
- 運用チーム
- Slack / Teams / メール

13.8 ログ保持期間
保持期間は企業ごとに設定可能。
※保持期間の正式ルールは 14章の保持ポリシーに統合。
例（企業向け標準）
- 操作ログ：3年
- 監査ログ：10年
- アーカイブ移行ログ：10年
- AI 利用ログ：5年
- システムログ：1年

13.9 企業向けログ・監査のまとめ
- すべての操作はログに記録
- 監査ログは改ざん不可で長期保持
- アーカイブ移行履歴も必ず保持
- AI 利用ログで参照文書を完全追跡
- システムログで障害解析
- メトリクス・トレース・アラートで可観測性を確保
- 保持期間は企業ごとに設定可能


14. バックアップ・災害対策（BCP/DR）仕様（完全統合版）
企業向け文書管理システムとして、
データ消失ゼロ・迅速な復旧・長期保全・企業側バックアップ推奨
を満たすためのバックアップ・災害対策（BCP/DR）を定義する。
本章では、以下を統合的に扱う。
- バックアップ（Full / Incremental / Archive）
- 復元（Single / Folder / Full）
- 災害対策（冗長化・スナップショット・AI degrade）
- アーカイブ連携（不可逆操作の保全）
- 企業側保持推奨（法令・監査対応）
- AI の安全運用（inference only）

14.1 バックアップの基本方針
バックアップは 多層構造（multi-layer） とし、次の 3 種類を保持する。
- フルバックアップ（Full Backup）
すべてのデータを完全保存。
- 差分バックアップ（Incremental Backup）
前回バックアップからの差分のみ保存。
- アーカイブ保持（Archive Retention）
長期保存用の最小データ（PDF / ハッシュ / 承認履歴）。
共通ルール：
- 削除禁止
- 改ざん不可
- append-only
- 保持期間は企業設定（14.4）

14.2 バックアップ対象データ
バックアップ対象：
- Document（content, fullText, hash）
- RevisionHistory（全改訂履歴）
- ApprovalHistory（承認履歴）
- ArchiveHistory（アーカイブ移行履歴）
- user_folder_access（ACL）
- テンプレート
- AI インデックス（embedding）
- システム設定（保持期間・公開範囲など）
バックアップ対象外：
- キャッシュ
- AI 推論結果（保存禁止）
- ローカル自動保存データ（クライアント側）

14.3 バックアップ頻度
バックアップは次の頻度で実行する。
- 毎日 1 回フルバックアップ
- 1 時間ごとに差分バックアップ
- アーカイブ移行時に即時バックアップ（重要）
アーカイブ移行は不可逆操作のため、
移行直前の状態を必ず保存する必要がある。

14.4 バックアップ保持期間（企業設定）
保持期間は企業ごとに設定可能。
例：
- フルバックアップ：1年
- 差分バックアップ：90日
- アーカイブ保持：10年
- 監査ログ：5〜10年
保持期間は管理者コンソールで変更可能。

14.5 復元（Restore）仕様
復元は次の 3 種類を提供する。
1. 文書単体復元（Single Document Restore）
復元対象：
- Document.content
- RevisionHistory
- ApprovalHistory
- hash
2. フォルダ単位復元（Folder Restore）
- フォルダ内の文書をまとめて復元
- ACL も復元対象
3. システム全体復元（Full System Restore）
- 災害時の復旧
- バックアップから全データを復元
復元操作は admin のみ可能。

14.6 災害対策（BCP/DR）
災害対策は次の 4 層で構成される。
1. データセンター冗長化
- プライマリ + セカンダリ
- 自動フェイルオーバー
- DB レプリケーション
2. スナップショット
- ストレージスナップショットを定期取得
- 復旧時間を短縮
3. AI 推論の冗長化
- AI サーバーは別ノード
- 障害時は degrade モードで全文検索のみ提供
4. 自動保存（Writer）との連携
- Writer は draft をサーバーに自動保存
- 通信断時はローカル保存
- 復元時にサーバー版とローカル版を比較

14.7 アーカイブとの統合（BCP 観点）
アーカイブは BCP の一部として扱う。
アーカイブの役割
- 長期保全
- DB 容量削減
- 検索高速化
- 災害時の復旧対象を縮小
アーカイブ移行時の処理
- content（blocks）を破棄
- PDF またはハッシュのみ保持
- ArchiveHistory に記録
- バックアップを即時実行

14.8 企業側へのダウンロード保持推奨
企業向け要件として、
企業自身が文書をダウンロードして保持することを強く推奨する。
理由：
- 法令遵守（ISO, FDA, GMP, J-SOX）
- システム障害時のリスク分散
- 監査対応
- 長期保全（10年以上）
通知フロー
- アーカイブ移行前にメール通知
- ダウンロード推奨メッセージを含む
- 管理者にも通知

14.9 AI の安全運用（BCP 観点）
AI は災害時にも安全に動作するように制御する。
AI の制限
- AI は学習にデータを使用しない（inference only）
- AI インデックスはバックアップ対象
- AI 障害時は degrade モードで全文検索のみ提供
- アーカイブ文書は AI の対象外

14.10 障害時の復旧手順（DR Runbook）
災害発生時の復旧手順：
- 障害検知（アラート）
- プライマリ → セカンダリへフェイルオーバー
- バックアップの整合性チェック
- 必要に応じてフル復元
- AI サーバーの復旧
- アーカイブ領域の整合性確認
- 管理者へ復旧完了通知

14.11 企業向け BCP/DR のまとめ
- バックアップはフル + 差分 + アーカイブの三層構造
- アーカイブ移行時は即時バックアップ
- Writer は自動保存でクラッシュ耐性を確保
- 災害時はフェイルオーバーで継続運用
- AI は学習禁止・安全モードで動作
- 企業側にもダウンロード保持を推奨
- アーカイブ移行履歴を保持し、監査性を保証
- 保持期間は企業ごとに設定可能


15. 管理者コンソール・運用管理仕様（完全統合版）
管理者コンソール（Admin Console）は、企業向け文書管理システムにおける
ユーザー管理・権限管理・フォルダアクセス権・文書種別・テンプレート・アーカイブ・保持期間・公開範囲・AI利用制御・監査ログ
を一元管理するための管理 UI である。
管理者（admin）は、システム全体の設定と運用を行う唯一のロールであり、
企業のセキュリティポリシー・運用ポリシーを反映する中心機能となる。

15.1 管理者コンソールの基本構造
管理者コンソールは次の 8 モジュールで構成される。
- ユーザー管理
- 権限（Role）管理
- フォルダアクセス権（ACL）管理
- 文書種別（DocumentType）管理
- テンプレート管理
- アーカイブ管理
- 保持期間・公開範囲設定
- 監査ログ・AI利用ログ閲覧
共通仕様：
- すべての操作は 監査ログ（Audit Log）に記録
- すべての設定変更は 即時反映
- すべてのデータは append-only / 改ざん不可（13章準拠）

15.2 ユーザー管理
管理者は次の操作が可能。
- ユーザーの作成
- ユーザーの無効化（disabled=true）
- パスワードリセットの強制発行
- ロール（role）の変更
- 所属部門（department / section / position）の設定
- 公開範囲（visibility_scope）に関連する属性の設定
ユーザー無効化時の仕様
- ログイン不可
- 文書の作成・編集不可
- 過去の承認履歴・RevisionHistory は保持
- AI 利用ログ・監査ログにも残る

15.3 権限（Role）管理
管理者はユーザーの role を変更できる。
ロール一覧（11章と完全一致）：
- user（閲覧のみ）
- creator（作成可能）
- checker（確認可能）
- approver（承認可能）
- admin（全権限）
仕様
- role の変更は即時反映
- role の変更履歴は監査ログに記録
- role と ACL は独立（両方満たす必要がある）
- 承認フローの役割は 5章のルールに従う

15.4 フォルダアクセス権（ACL）管理
管理者はフォルダ単位でユーザーのアクセス権を設定できる。
設定項目：
- canRead（閲覧可）
- canWrite（編集可）
仕様：
- user_folder_access はユーザー × フォルダでユニーク
- ACL の変更は即時反映
- ACL の変更履歴は監査ログに記録
- ACL は role と独立（両方満たす必要がある）
- ACL は将来の運用変更に対応できる柔軟な構造

15.5 文書種別（DocumentType）管理
管理者は文書種別を管理できる。
設定項目：
- code（例：WI, SOP, MANUAL）
- name
- prefix（文書番号生成に使用）
- description
仕様：
- 文書種別の追加・更新が可能
- 既存文書の DocumentType は変更不可（整合性のため）
- 文書種別の変更履歴は監査ログに記録

15.6 テンプレート管理
管理者はテンプレートを管理できる。
操作：
- テンプレート作成
- テンプレート更新
- テンプレートの無効化（使用禁止）
仕様：
- テンプレート更新は既存文書に影響しない
- content は Block JSON Schema に準拠
- テンプレートの変更履歴は監査ログに記録
- テンプレート作成者（created_by）は保持

15.7 アーカイブ管理
アーカイブは企業向け運用の中心機能。
管理者が行える操作：
- アーカイブ移行の強制実行
- アーカイブ解除（復元）
- アーカイブ保持期間の設定
- アーカイブ移行履歴の閲覧
仕様：
- アーカイブ文書は検索対象外
- content（blocks）は保持しない
- PDF またはハッシュのみ保持
- アーカイブ移行履歴は削除不可
- アーカイブ移行は 12章・14章の BCP/DR 仕様に従う

15.8 保持期間・公開範囲設定
管理者は企業ごとに保持ポリシーを設定できる。
設定項目：
- 原文保持期間（例：5年）
- アーカイブ保持期間（例：10年）
- 監査ログ保持期間
- 公開範囲（visibility_scope）のデフォルト設定
- 文書の公開対象ユーザーの制限
仕様：
- 変更は即時反映
- 変更履歴は監査ログに記録
- 文書の公開範囲は
ACL（フォルダアクセス権） × visibility_scope（公開範囲）
の両方を満たす必要がある（11章と整合）

15.9 監査ログ・AI利用ログ閲覧
管理者はすべてのログを閲覧できる。
閲覧可能ログ：
- 操作ログ
- 監査ログ
- アーカイブ移行ログ
- AI 利用ログ
- システムログ（エラー・障害）
検索条件：
- user_id
- document_id
- action
- 日付範囲
- 成功 / 失敗
仕様：
- ログは改ざん不可
- ログは削除不可
- ログは企業設定の保持期間に従って保存
- AI 利用ログは参照文書（management_number）を完全追跡可能（13章準拠）

15.10 管理者コンソールの非機能要件
- すべての操作は即時反映
- すべての操作は監査ログに記録
- UI はシンプルで階層的
- 大規模ユーザーでも高速に動作
- 企業ごとの設定を完全に分離（マルチテナント対応）
- 監査ログ・アーカイブ履歴は高速検索可能
- 管理者操作はすべて RBAC + ACL + visibility_scope を尊重

15.11 管理者コンソールのまとめ
- ユーザー・権限・ACL を一元管理
- 文書種別・テンプレートを管理
- アーカイブ移行・保持期間を管理
- 公開範囲（visibility_scope）を制御
- 監査ログ・AI利用ログを閲覧
- 企業向け運用に必要なすべての設定を管理者が制御
- すべての操作は監査ログに記録され、改ざん不可

16章　AIドキュメントライフサイクル（文書改善ループ）
AI は文書の一生を管理し、
文書生成 → 構造化 → 検索 → 改訂 → 承認 → 改訂履歴 → ISO対応 → 再改善
という循環を自動化する。
16.1 文書生成（AI Writer）
- 文書種別（標準書・手順書・チェックシート）に応じた構造で生成
- 組織固有のルール（安全・品質・工程）を反映
- 過去文書を引用して整合性を確保
- AI 厳格度（strict / standard / improvement）により生成品質を制御
16.2 文書構造化
生成された文書は以下の構造に自動変換される：
- content.blocks
- metadata（文書種別・重要度・工程・装置情報）
- 文書階層（親子）
- revision / hash
16.3 文書検索（AI検索）
装置特定（メーカー × 型式 × 装置管理番号）と
段落 embedding による意味検索を組み合わせる。
16.4 文書改訂（AI改訂案）
- 改訂前後の差分を意味解析
- 工程変更・安全基準変更などの意味分類
- 段落単位で改訂案を生成
- AIチャット欄に提示し、ユーザーがエディタで修正
16.5 文書整合性チェック（AI問題パネル）
VSCode の「問題」パネルと同様に、文書ネットワーク全体の不整合を検出。
16.6 承認フローと ISO 対応
- AI 提案は必ず人間が承認
- revisionHistory にすべて記録
- ISO / GMP / FDA / J-SOX の要求を満たす

17章　AI検索エンジン（装置特定 × 段落検索 × 意味検索）
AI検索は以下の 3 層で構成される。

17.1 メタデータフィルタ（装置特定）
検索対象を装置単位で特定するため、以下を必須とする：
- メーカー（maker）
- 型式（model）
- 装置管理番号（assetId）
- 工程（process）
- 文書種別（document_type）
- 重要度（importance）
これにより、似た装置の誤ヒットを防ぐ。

17.2 段落 embedding 検索
DocumentParagraph（段落ID）単位で embedding を保持し、
意味検索を行う。
返却値：
- documentId
- paragraphId
- score
- snippet

17.3 LLM による最終フィルタ
- 装置情報
- 文書内容
- 工程
- 文書種別
これらの整合性を LLM がチェックし、誤ヒットを除外する。

18章　AI改訂エンジン（意味差分 × 段落単位）
AI は文書の改訂前後の差分を解析し、
段落単位で改訂案を生成する。

18.1 差分の意味解析
- 工程変更
- 安全基準変更
- 品質基準変更
- 装置構造の変更
- 注意事項の変更
これらを分類し、影響範囲を特定する。

18.2 影響範囲の特定
文書ネットワーク（階層・リンク）を解析し、
影響を受ける文書・段落を抽出する。

18.3 改訂案生成
AI は以下を生成する：
- 修正すべき段落の抽出
- 修正案（before → after）
- 修正理由
- 上位文書との整合性説明
改訂案は AI チャット欄に表示し、ユーザーがエディタで修正する。

19章　AI整合性チェック（文書ネットワーク問題検出）
VSCode の「問題」パネルと同様の仕組みを文書に適用する。

19.1 検出する問題の種類
- 上位文書と下位文書の矛盾
- 装置変更に追従していない段落
- 工程番号の不一致
- 安全基準の旧版使用
- 類似文書との内容差異
- 文書間リンクの破損

19.2 DocumentIssue モデル
- issueId
- documentId
- paragraphId
- severity（error / warning / info）
- message
- createdAt

19.3 問題パネル UI
- 問題一覧を表示
- クリックで該当段落へジャンプ
- 修正後は自動で問題が解消される（LSP と同様）

20章　AI × ISO / 品質保証対応仕様
AI は文書の生成・改訂・承認・履歴管理を通じて、
ISO 9001 / ISO 13485 / GMP / FDA / J-SOX などの品質保証要求に対応する。

20.1 ISO が要求する文書管理要件（要点）
AI システムは以下の要求を満たすために設計される。
- 文書の一貫性
- 文書の最新版管理
- 改訂履歴の完全保存
- 承認フローの明確化
- 文書の適用範囲の明示
- 文書間の整合性
- 文書の定期見直し
- 証跡（Evidence）の保持
AI はこれらを自動化・補助する。

20.2 AI による ISO 対応の自動化
AI は以下の機能で ISO 要求を満たす。
- 文書改訂時の 差分説明（before/after）
- 改訂理由の自動生成
- 上位文書との整合性チェック
- 承認フローの強制（AI は承認しない）
- revisionHistory の自動更新
- 文書の定期見直しアラート
- 文書の適用範囲の自動抽出

20.3 AI が生成する ISO 証跡（Evidence）
AI は以下の証跡を自動生成する。
- 改訂理由（Reason for Change）
- 影響範囲（Impact Analysis）
- 関連文書の一覧
- 整合性チェック結果
- 改訂案の根拠（引用元）
これにより、監査対応が容易になる。

20.4 承認フローとの連携
AI は承認フローを補助するが、承認は必ず人間が行う。
- AI は承認を代行しない
- AI は承認者に必要な情報（差分・理由・影響範囲）を提示
- 承認後に revisionHistory を更新

20.5 文書の定期見直し（Periodic Review）
AI は文書の重要度に応じて見直し周期を管理する。
例：
- 重要度 A：6ヶ月
- 重要度 B：12ヶ月
- 重要度 C：24ヶ月
期限が近づくと AI が通知し、
「この文書は最新の上位文書と整合していますか？」
と確認する。


21章　AI による文書ネットワーク最適化（柔軟な関係モデル）
文書ネットワークは、製造業の文書体系を AI が理解しやすくするための “ゆるやかな関係モデル（Soft Relationship Model）” に基づいて構築される。
ここで定義される関係は 絶対的・強制的な階層ではなく、AI が推論・検索・整合性チェックを行うための “参考的な構造” として扱われる。

21.1 文書ネットワークの柔軟な関係性（Soft Relationship Model）
文書間の関係は以下のように「一般的にそうであることが多い」という 曖昧で柔軟な関係 として扱う。
- 親文書 → 子文書（一般的な階層構造）
- 標準書 → 手順書（標準書が上位であることが多い）
- 手順書 → チェックシート（手順書を基に作られることが多い）
- 装置 → 工程 → 文書群（装置に紐づく文書が多い）
- 文書間リンク（参照・引用・関連性）
これらは 必ずしも固定ではなく、例外を許容する。
重要仕様
- 文書間の関係は 強制ではなく推奨
- AI は関係性を「確率的・推論的」に扱う
- 文書が関係を持たなくてもエラーにしない
- 関係の種類はユーザーが自由に追加可能
- 文書の種類や現場文化に応じて関係性は変化する

21.2 AI による関係性の推論
AI は文書の内容・タイトル・工程・装置情報をもとに、
「この文書はどの文書と関係がありそうか？」 を推論する。
推論に使う情報：
- 文書タイトル
- 文書種別
- 工程番号
- 装置情報（メーカー・型式・管理番号）
- 文書の全文（fullText）
- 過去の改訂履歴
- 文書間リンクの履歴
AI はこれらを総合して、
関係性の強さ（0〜1のスコア） を算出する。
例：
- 標準書と手順書の関係：0.92
- 手順書とチェックシートの関係：0.87
- 装置 XYZ-2000 と工程3の文書：0.95

21.3 関係性の柔軟な更新
文書ネットワークは固定ではなく、AI によって動的に更新される。
更新タイミング：
- 文書の改訂
- 文書の新規作成
- 文書の削除
- 装置情報の更新
- 工程の変更
- 文書間リンクの追加・削除
AI はこれらの変化を検知し、
関係性スコアを再計算してネットワークを更新する。

21.4 関係性の曖昧さを前提とした整合性チェック
関係が曖昧であることを前提に、AI は以下を行う。
- 関係性スコアが高い文書同士の整合性チェック
- スコアが低い場合は警告を弱める
- 関係が不明確な場合は「参考情報」として扱う
- 文書間リンクがない場合でも推論で関係を補完
これにより、
現場の実態に合わせた柔軟な整合性チェック が可能になる。

21.5 ユーザーによる関係性の上書き（Override）
ユーザーは AI の推論を上書きできる。
- 「この文書はこの標準書の下位文書である」
- 「この文書はこの装置に紐づかない」
- 「この文書は工程3ではなく工程5に属する」
上書きされた関係は AI の学習に反映され、以降の推論精度が向上する。

21.6 関係性の可視化（曖昧さを含む）
文書ネットワークは以下のように可視化される。
- ノード：文書
- エッジ：関係性
- エッジの太さ：関係性スコア
- 色：文書種別
- グループ：装置・工程・フォルダ
これにより、
曖昧な関係も含めた“現場のリアルな文書構造” が見える。

22章　AI による装置別ナレッジベース構築（Equipment Knowledge Base）
装置ごとに文書・工程・注意事項・トラブルシュート情報を
AI が自動でナレッジベース化する。

22.1 装置特定のキー
装置は以下の3つで一意に特定される。
- メーカー（maker）
- 型式（model）
- 装置管理番号またはシリアルナンバー（assetId）

22.2 装置別ナレッジベースの構成
AI は装置ごとに以下を自動生成する。
- 装置概要
- 工程一覧
- 使用文書一覧
- 注意事項
- トラブルシュート
- 点検項目
- 過去の改訂履歴
- 関連文書のネットワーク

22.3 AI による装置固有語彙の学習
AI は装置ごとの語彙を辞書化し、検索精度を向上させる。
例：
- XYZテーブル
- スピンドル
- チャック
- アクチュエータ

22.4 装置変更時の自動追従
装置の仕様変更があった場合、AI は以下を行う。
- 影響文書の特定
- 改訂案の生成
- 問題パネルへの警告表示
- 承認フローへの連携

23章　AI ガバナンス・安全性・誤生成対策
AI を安全に運用するためのガバナンス仕様。

23.1 AI の責任範囲
AI は以下を行うが、最終判断は人間が行う。
- 文書生成
- 改訂案生成
- 整合性チェック
- 要約・比較・統合
AI は承認・決裁を行わない。

23.2 偽データ対策
- 会話リセット
- 上位 N 件のみを LLM に渡す
- 文書番号を明示して参照
- AI が引用する際は snippet を必須化

23.3 AI の制限
AI は以下を行わない。
- 勝手な文書改訂
- 勝手な承認
- 文書の削除
- 文書の重要度変更
- 文書階層の変更

23.4 AI の透明性
AI が生成する内容には以下を付与する。
- 生成理由
- 引用元
- 参照文書番号
- 改訂理由
