# テスト計画書

**対象システム**: 承認フロー・改定フロー統合システム  
**作成日**: 2026年1月15日

---

## 1. テストシナリオ

### シナリオ1: 新規文書の承認フロー

**目的**: 初回承認時の管理番号とRevisionHistoryの作成を検証

**手順**:
1. Writer（user）でログイン
2. 新規文書を作成（draft）
3. 下書き保存 → `POST /api/documents/save-draft`
4. 承認申請 → `POST /api/documents/submit`
5. Approver（approver）でログイン
6. 承認者ダッシュボード（`/approver`）で文書を確認
7. 承認 → `POST /api/documents/approve`

**期待結果**:
- 文書のステータスが `approved` になる
- 管理番号が `A-1` になる
- RevisionHistory が作成される
  - `management_number`: "A-1"
  - `revision_symbol`: "R0"
  - `approved_by_id`: 承認者のID
  - `approved_at`: 現在時刻

---

### シナリオ2: 承認済み文書の改定フロー

**目的**: 改定記号の正しい採番とRevisionHistoryの更新を検証

**前提条件**: シナリオ1が完了していること

**手順**:
1. Writer（creator）でログイン
2. 承認済み文書の詳細ページ（`/documents/[id]`）を開く
3. 改定開始 → `POST /api/documents/revise`
4. 文書を編集して下書き保存
5. 承認申請 → `POST /api/documents/submit`
6. Approver（approver）でログイン
7. 承認 → `POST /api/documents/approve`

**期待結果**:
- 改定開始時:
  - 文書のステータスが `draft` になる
  - ApprovalHistory に `revised` アクションが記録される
  - コメントに `(R1)` が含まれる
- 承認時:
  - 文書のステータスが `approved` になる
  - 管理番号が `A-2` になる
  - RevisionHistory が新規作成される
    - `management_number`: "A-2"
    - `revision_symbol`: "R1"
    - `approved_by_id`: 承認者のID
    - `approved_at`: 現在時刻
  - 過去のRevisionHistory（A-1, R0）は変更されない

---

### シナリオ3: 複数回の改定

**目的**: 改定記号と管理番号が正しく増加することを検証

**前提条件**: シナリオ2が完了していること

**手順**:
1. 改定開始 → `POST /api/documents/revise`
2. 編集して承認申請 → `POST /api/documents/submit`
3. 承認 → `POST /api/documents/approve`
4. 上記を2回繰り返す

**期待結果**:
- 2回目の承認:
  - 管理番号: `A-3`
  - 改定記号: `R2`
- 3回目の承認:
  - 管理番号: `A-4`
  - 改定記号: `R3`
- 全てのRevisionHistoryが保存されている
- 改訂履歴ページ（`/writer/[id]/revisions`）で全履歴が確認できる

---

### シナリオ4: 差し戻しフロー

**目的**: 差し戻し時にRevisionHistoryが作成されないことを検証

**手順**:
1. 文書を作成して承認申請
2. Approverでログイン
3. 差し戻し → `POST /api/documents/reject`

**期待結果**:
- 文書のステータスが `draft` になる
- RevisionHistory は作成されない
- ApprovalHistory に `rejected` アクションが記録される

---

### シナリオ5: 引き戻しフロー

**目的**: 承認待ち文書の引き戻しを検証

**手順**:
1. 文書を作成して承認申請（pending）
2. Creatorでログイン
3. 引き戻し → `POST /api/documents/withdraw`

**期待結果**:
- 文書のステータスが `draft` になる
- ApprovalRequest が削除される
- RevisionHistory は作成されない
- ApprovalHistory に `withdrawn` アクションが記録される

---

### シナリオ6: バルク承認

**目的**: 複数文書の一括承認を検証

**手順**:
1. 3つの文書を作成して承認申請
2. Approverでログイン
3. 承認者ダッシュボードで3つ選択
4. 一括承認

**期待結果**:
- 全ての文書が `approved` になる
- 各文書に個別の管理番号が割り当てられる
- 各文書にRevisionHistoryが作成される

---

### シナリオ7: 改定版の承認者ダッシュボード表示

**目的**: UIに改定版バッジと情報が正しく表示されることを検証

**前提条件**: シナリオ2が完了していること

**手順**:
1. 改定版の文書を承認申請（pending）
2. Approverでログイン
3. 承認者ダッシュボード（`/approver`）を開く

**期待結果**:
- 文書カードに紫色の「改定版」バッジが表示される
- 管理番号（A-1など）が表示される
- 改定記号（R1など）がバッジで表示される
- 前回承認者の名前が表示される
- プレビューに改訂履歴リンクが表示される

---

## 2. API単体テスト

### `POST /api/documents/save-draft`
- ✅ 認証チェック
- ✅ 新規作成
- ✅ 既存文書の更新
- ✅ 作成者以外の編集をブロック
- ✅ draft以外の編集をブロック

### `POST /api/documents/submit`
- ✅ 認証チェック
- ✅ draft → pending 遷移
- ✅ 作成者以外の申請をブロック
- ✅ draft以外の申請をブロック
- ✅ ApprovalRequest作成
- ✅ ApprovalHistory記録

### `POST /api/documents/approve`
- ✅ 承認者権限チェック
- ✅ pending → approved 遷移
- ✅ 管理番号の生成（A-1, A-2...）
- ✅ RevisionHistory作成
- ✅ 改定記号の正しい設定（R0, R1...）
- ✅ ApprovalRequest削除
- ✅ ApprovalHistory記録

### `POST /api/documents/reject`
- ✅ 承認者権限チェック
- ✅ pending → draft 遷移
- ✅ RevisionHistory未作成
- ✅ ApprovalRequest削除
- ✅ ApprovalHistory記録

### `POST /api/documents/revise`
- ✅ 認証チェック
- ✅ approved → draft 遷移
- ✅ 作成者以外の改定をブロック
- ✅ approved以外の改定をブロック
- ✅ 改定記号の計算（承認済みのみカウント）
- ✅ ApprovalHistory記録（改定記号含む）

### `POST /api/documents/withdraw`
- ✅ 認証チェック
- ✅ pending → draft 遷移
- ✅ 作成者以外の引き戻しをブロック
- ✅ pending以外の引き戻しをブロック
- ✅ ApprovalRequest削除
- ✅ ApprovalHistory記録

### `GET /api/documents/[id]/revisions`
- ✅ 認証チェック
- ✅ 承認済みRevisionHistoryのみ取得
- ✅ 新しい順でソート
- ✅ User情報のinclude

### `GET /api/documents/[id]/history`
- ✅ 認証チェック
- ✅ ApprovalHistory取得
- ✅ 新しい順でソート
- ✅ User情報のinclude

---

## 3. データ整合性テスト

### RevisionHistory
- [ ] 承認済み文書のみレコードが存在する
- [ ] 管理番号が昇順で連続している（A-1, A-2, A-3...）
- [ ] 改定記号が正しい（初版はR0、改定はR1, R2...）
- [ ] 過去のレコードが変更されていない
- [ ] approved_at が null でない

### 管理番号
- [ ] 承認時に正しく採番される
- [ ] Document.management_number と RevisionHistory.management_number が一致
- [ ] 承認済みRevisionHistoryの件数 + 1 = 新しい管理番号

### 改定記号
- [ ] 初版は R0
- [ ] 改定後は R1, R2, R3...
- [ ] 承認済みRevisionHistoryの件数 = 改定記号の数字 + 1

---

## 4. パフォーマンステスト

### データベースクエリ
- [ ] N+1問題がない（include/selectを使用）
- [ ] 必要なインデックスが設定されている
- [ ] トランザクションが適切に使用されている

### API応答時間
- [ ] 文書一覧取得: < 500ms
- [ ] 文書詳細取得: < 300ms
- [ ] 承認処理: < 1000ms
- [ ] バルク承認（10件）: < 3000ms

---

## 5. セキュリティテスト

### 認証
- [ ] 全APIでrequireAuth()が呼ばれている
- [ ] 未認証時に401エラーが返される

### 権限
- [ ] 承認APIで承認者権限チェック
- [ ] 作成者のみが自分の文書を編集できる
- [ ] 承認者が他人の文書を編集できない

### SQLインジェクション
- [ ] Prismaを使用しているため基本的に安全
- [ ] パラメータが適切にエスケープされている

---

## 6. UI/UXテスト

### 承認者ダッシュボード
- [ ] 改定版バッジが正しく表示される
- [ ] 管理番号と改定記号が表示される
- [ ] 前回承認者が表示される
- [ ] プレビューに改訂履歴リンクがある
- [ ] バルク選択が正しく動作する

### 改訂履歴ページ
- [ ] 全てのRevisionHistoryが表示される
- [ ] テーブルが読みやすい
- [ ] 承認待ちは「承認待ち」と表示される
- [ ] バッジの色分けが適切

---

## 7. テスト実行チェックリスト

### 準備
- [ ] データベースをリセット（`npx prisma migrate reset`）
- [ ] シードデータを投入（`npx prisma db seed`）
- [ ] 開発サーバーを起動（`npm run dev`）

### 実行
- [ ] シナリオ1〜7を順番に実行
- [ ] 各APIの単体テストを実行
- [ ] データ整合性を確認
- [ ] セキュリティテストを実行
- [ ] UI/UXテストを実行

### 記録
- [ ] 不具合を記録
- [ ] スクリーンショットを撮影
- [ ] ログを確認

---

## 8. 修正後の再テスト項目

### 優先度: 高
- [ ] **改定記号の計算ロジック** (revise API)
- [ ] **管理番号の計算** (approve API)
- [ ] **RevisionHistoryの作成タイミング** (approve API)

### 優先度: 中
- [ ] 承認者ダッシュボードの表示
- [ ] 改訂履歴ページの表示

---

## 9. 既知の制約事項

1. **checked_by_id（確認者）**: 現在は未実装（将来の拡張ポイント）
2. **CSRF保護**: 現在は未実装（本番環境では必須）
3. **レート制限**: 現在は未実装（本番環境では推奨）
4. **監査ログ**: ApprovalHistoryが監査ログの役割を果たす

---

## 10. 次のステップ

1. ✅ 改定記号計算ロジックの修正
2. ✅ 管理番号計算の明示化
3. ✅ 型定義の共通化
4. [ ] 全シナリオのテスト実行
5. [ ] 不具合の修正
6. [ ] パフォーマンステストの実施
7. [ ] ドキュメント更新
