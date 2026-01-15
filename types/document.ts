// 共通型定義

// ユーザー
export interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "approver" | "user";
}

// フォルダ
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

// 文書ステータス
export type DocumentStatus = "draft" | "pending" | "approved";

// 承認アクション
export type ApprovalAction = "submitted" | "approved" | "rejected" | "withdrawn" | "revised";

// ブロック（簡易版）
export interface Block {
  id: number;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  text?: string;
  src?: string;
  [key: string]: any;
}

// 承認リクエスト
export interface ApprovalRequest {
  id: number;
  requester: {
    id: number;
    name?: string;
    email: string;
  };
  requested_at: string;
  comment: string | null;
}

// 改訂履歴
export interface RevisionHistory {
  id: number;
  managementNumber: string;
  revisionSymbol: string;
  title: string;
  approvedBy: { id: number; name: string } | null;
  checkedBy: { id: number; name: string } | null;
  createdBy: { id: number; name: string };
  approvedAt: string | null;
  createdAt: string;
}

// 文書（一覧用）
export interface DocumentListItem {
  id: number;
  title: string;
  status: DocumentStatus;
  managementNumber?: string | null;
  creator: {
    id: number;
    name?: string;
    email: string;
    role: string;
  };
  approvalRequest?: ApprovalRequest;
  latestRevision?: {
    id: number;
    managementNumber: string;
    revisionSymbol: string;
    approvedBy: { id: number; name: string } | null;
    approvedAt: string | null;
  } | null;
  blockCount: number;
  createdAt: string;
  updatedAt: string;
}

// 文書（詳細用）
export interface DocumentDetail {
  id: number;
  title: string;
  status: DocumentStatus;
  managementNumber?: string | null;
  creator: {
    id: number;
    name?: string;
    email: string;
    role: string;
  };
  blocks: Block[];
  approvalRequest?: ApprovalRequest;
  latestRevision?: {
    id: number;
    managementNumber: string;
    revisionSymbol: string;
    title: string;
    approvedBy: { id: number; name: string } | null;
    checkedBy: { id: number; name: string } | null;
    createdBy: { id: number; name: string };
    approvedAt: string | null;
  } | null;
  revisionCount: number;
  createdAt: string;
  updatedAt: string;
}

// 承認履歴アイテム
export interface ApprovalHistoryItem {
  id: number;
  action: ApprovalAction;
  comment: string | null;
  createdAt: string;
  user: {
    id: number;
    name?: string;
    email: string;
    role: string;
  };
}

// APIレスポンス
export interface ApiResponse<T = any> {
  ok: boolean;
  data?: T;
  error?: string;
}

// 文書一覧レスポンス
export interface DocumentListResponse extends ApiResponse {
  documents: DocumentListItem[];
}

// 文書詳細レスポンス
export interface DocumentDetailResponse extends ApiResponse {
  document: DocumentDetail;
}

// 改訂履歴レスポンス
export interface RevisionHistoryResponse extends ApiResponse {
  revisions: RevisionHistory[];
}

// 承認履歴レスポンス
export interface ApprovalHistoryResponse extends ApiResponse {
  history: ApprovalHistoryItem[];
}
