/**
 * フォルダ管理の型定義
 * 
 * ⚠️ 注意: LocalStorageベースの実装は lib/_archived/folderManagement.ts.old に移動しました
 * 新しいシステムでは Prisma + API ベースの実装を使用してください。
 * 
 * この型定義は FolderTree コンポーネントとの互換性のために残されています。
 */

export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  path: string[];
  children?: Folder[];
}

export interface Document {
  id: string;
  managementNumber: string;
  title: string;
  folderId: string;
  folderPath: string[];
  creator: string;
  createdAt: string;
  status: "draft" | "submitted" | "checking" | "approved" | "rejected";
  templateId: string;
  blocks: any[];
  fullText: string;
  aiIndexId: string;
}

export interface DocumentMetadata {
  title: string;
  managementNumber: string;
  hierarchy: string[];
  templateId: string;
  createdAt: string;
  createdBy: string;
}

export interface DocumentVersion {
  id: string;
  versionNumber: number;
  createdAt: string;
  createdBy: string;
  blocks: any[];
  documentData: {
    blocks: any[];
    metadata: DocumentMetadata;
  };
  fullText: string;
}

export interface ApprovalRecord {
  role: "creator" | "checker" | "approver";
  userName: string;
  timestamp: string;
  status: "pending" | "approved" | "rejected";
  comment?: string;
}

// 以下の関数は LocalStorage ベースの古い実装です
// lib/_archived/folderManagement.ts.old を参照してください
//
// - getFolders()
// - saveFolders()
// - addFolder()
// - deleteFolder()
// - renameFolder()
// - getDocuments()
// - saveDocuments()
// - getDocumentsByFolder()
// - generateManagementNumber()
// - generateAiIndexId()
// - extractFullText()
// - submitDocument()

/**
 * ⚠️ 以下の関数を使用しないでください
 * 代わりに以下のAPIを使用してください:
 * 
 * - GET/POST /api/folders - フォルダ管理
 * - GET/POST /api/documents - 文書管理
 * - POST /api/documents/submit - 文書提出
 */

export function getFolders(): Folder[] {
  throw new Error("getFolders() is deprecated. Use GET /api/folders instead.");
}

export function saveFolders(folders: Folder[]): void {
  throw new Error("saveFolders() is deprecated. Use POST /api/folders instead.");
}

export function addFolder(parentId: string, name: string): Folder[] {
  throw new Error("addFolder() is deprecated. Use POST /api/folders instead.");
}

export function deleteFolder(folderId: string): Folder[] {
  throw new Error("deleteFolder() is deprecated. Use DELETE /api/folders/:id instead.");
}

export function renameFolder(folderId: string, newName: string): Folder[] {
  throw new Error("renameFolder() is deprecated. Use PUT /api/folders/:id instead.");
}

export function getDocuments(): Document[] {
  throw new Error("getDocuments() is deprecated. Use GET /api/documents instead.");
}

export function saveDocuments(documents: Document[]): void {
  throw new Error("saveDocuments() is deprecated. Use POST /api/documents instead.");
}

export function getDocumentsByFolder(folderId: string): Document[] {
  throw new Error("getDocumentsByFolder() is deprecated. Use GET /api/documents?folderId=X instead.");
}

export function generateManagementNumber(folderPath: string[]): string {
  throw new Error("generateManagementNumber() is deprecated. Management numbers are now auto-generated on document approval.");
}

export function generateAiIndexId(managementNumber: string, documentId: string): string {
  throw new Error("generateAiIndexId() is deprecated.");
}

export function extractFullText(blocks: any[]): string {
  throw new Error("extractFullText() is deprecated.");
}

export function submitDocument(
  title: string,
  folderId: string,
  folderPath: string[],
  templateId: string,
  blocks: any[],
  creator: string
): Document {
  throw new Error("submitDocument() is deprecated. Use POST /api/documents/submit instead.");
}
