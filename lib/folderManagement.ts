/**
 * ⚠️ 注意: このファイルは LocalStorage ベースのレガシー実装です
 * 
 * 新しい文書管理システムは Prisma + SQLite ベースに移行しています。
 * このファイルは /dashboard/documents などで参照されていますが、
 * 新規機能は Prisma ベースの API (/api/documents, /api/folders) を使用してください。
 * 
 * Prisma ベースのシステム:
 * - Schema: prisma/schema.prisma の Document, Folder モデル
 * - API: /api/documents, /api/folders
 * - 管理番号: フォルダコード + 連番（例: WI-001, MANUAL-015）
 * - 生成タイミング: submit API で生成
 */

export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  path: string[]; // ["A", "B", "001"]
  children?: Folder[];
}

export interface DocumentVersion {
  id: string;
  versionNumber: number;
  createdAt: string;
  createdBy: string;
  blocks: any[]; // ブロック構造
  documentData: {
    blocks: any[];
    metadata: DocumentMetadata;
  };
  fullText: string; // 全文（テキスト検索用）
}

export interface DocumentMetadata {
  title: string;
  managementNumber: string;
  hierarchy: string[];
  templateId: string;
  createdAt: string;
  createdBy: string;
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
  blocks: any[]; // 互換性のため保持
  approvalHistory: ApprovalRecord[];
  // 新規フィールド（構造化データ）
  versions: DocumentVersion[];
  currentVersionId: string;
  metadata: DocumentMetadata;
  fullText: string;
  aiIndexId: string; // AI検索用の一意ID
}

export interface ApprovalRecord {
  role: "creator" | "checker" | "approver";
  userName: string;
  timestamp: string;
  status: "pending" | "approved" | "rejected";
  comment?: string;
}

// フォルダーツリーを取得
export function getFolders(): Folder[] {
  const stored = localStorage.getItem("folders");
  return stored ? JSON.parse(stored) : getDefaultFolders();
}

// デフォルトフォルダー
function getDefaultFolders(): Folder[] {
  return [
    {
      id: "root",
      name: "ルート",
      parentId: null,
      path: [],
      children: [],
    },
  ];
}

// フォルダーを保存
export function saveFolders(folders: Folder[]) {
  localStorage.setItem("folders", JSON.stringify(folders));
}

// フォルダーを追加
export function addFolder(parentId: string, name: string): Folder[] {
  const folders = getFolders();
  const parent = findFolderById(folders, parentId);
  if (!parent) return folders;

  const newFolder: Folder = {
    id: Date.now().toString(),
    name,
    parentId,
    path: [...parent.path, name],
    children: [],
  };

  if (!parent.children) parent.children = [];
  parent.children.push(newFolder);

  saveFolders(folders);
  return folders;
}

// フォルダーを削除
export function deleteFolder(folderId: string): Folder[] {
  const folders = getFolders();
  const result = removeFolderById(folders, folderId);
  saveFolders(result);
  return result;
}

// フォルダー名を変更
export function renameFolder(folderId: string, newName: string): Folder[] {
  const folders = getFolders();
  const folder = findFolderById(folders, folderId);
  if (!folder) return folders;

  folder.name = newName;
  updatePaths(folder);

  saveFolders(folders);
  return folders;
}

// フォルダーを検索
function findFolderById(folders: Folder[], id: string): Folder | null {
  for (const folder of folders) {
    if (folder.id === id) return folder;
    if (folder.children) {
      const found = findFolderById(folder.children, id);
      if (found) return found;
    }
  }
  return null;
}

// フォルダーを削除（再帰）
function removeFolderById(folders: Folder[], id: string): Folder[] {
  return folders
    .filter((f) => f.id !== id)
    .map((f) => ({
      ...f,
      children: f.children ? removeFolderById(f.children, id) : [],
    }));
}

// パスを更新（名前変更時）
function updatePaths(folder: Folder) {
  const parent = folder.parentId
    ? findFolderById(getFolders(), folder.parentId)
    : null;
  folder.path = parent ? [...parent.path, folder.name] : [folder.name];

  if (folder.children) {
    folder.children.forEach((child) => updatePaths(child));
  }
}

// 文書を取得
export function getDocuments(): Document[] {
  const stored = localStorage.getItem("documents");
  return stored ? JSON.parse(stored) : [];
}

// 文書を保存
export function saveDocuments(documents: Document[]) {
  localStorage.setItem("documents", JSON.stringify(documents));
}

// フォルダー内の文書を取得
export function getDocumentsByFolder(folderId: string): Document[] {
  const documents = getDocuments();
  return documents.filter((doc) => doc.folderId === folderId);
}

// 管理番号を生成
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

// AI検索用の一意IDを生成
export function generateAiIndexId(
  managementNumber: string,
  documentId: string
): string {
  // managementNumber + documentId + timestamp のハッシュ値的な一意ID
  // 簡易実装：base64エンコード
  const combined = `${managementNumber}:${documentId}:${Date.now()}`;
  return Buffer.from(combined).toString("base64").replace(/[=]+$/, "");
}

// ブロックから全テキストを抽出する
export function extractFullText(blocks: any[]): string {
  const textParts: string[] = [];

  blocks.forEach((block: any) => {
    if (block.type === "text" && block.label) {
      textParts.push(block.label);
    } else if ((block.type === "titlePlaceholder" || block.type === "subtitlePlaceholder") && block.value) {
      textParts.push(block.value);
    } else if (block.type === "table" && block.cells) {
      block.cells.forEach((row: any) => {
        row.forEach((cell: any) => {
          if (cell.text) {
            textParts.push(cell.text);
          }
        });
      });
    }
  });

  return textParts.join(" ");
}

// 文書を提出
export function submitDocument(
  title: string,
  folderId: string,
  folderPath: string[],
  templateId: string,
  blocks: any[],
  creator: string
): Document {
  const documents = getDocuments();
  const managementNumber = generateManagementNumber(folderPath);
  const createdAt = new Date().toISOString();
  const fullText = extractFullText(blocks);

  const metadata: DocumentMetadata = {
    title,
    managementNumber,
    hierarchy: folderPath,
    templateId,
    createdAt,
    createdBy: creator,
  };

  const versionId = Date.now().toString();
  const documentId = Date.now().toString();
  const aiIndexId = generateAiIndexId(managementNumber, documentId);

  const version: DocumentVersion = {
    id: versionId,
    versionNumber: 1,
    createdAt,
    createdBy: creator,
    blocks,
    documentData: {
      blocks,
      metadata,
    },
    fullText,
  };

  const newDocument: Document = {
    id: documentId,
    managementNumber,
    title,
    folderId,
    folderPath,
    creator,
    createdAt,
    status: "submitted",
    templateId,
    blocks, // 互換性のため保持
    versions: [version],
    currentVersionId: versionId,
    metadata,
    fullText,
    aiIndexId,
    approvalHistory: [
      {
        role: "creator",
        userName: creator,
        timestamp: createdAt,
        status: "approved",
      },
      {
        role: "checker",
        userName: "",
        timestamp: "",
        status: "pending",
      },
      {
        role: "approver",
        userName: "",
        timestamp: "",
        status: "pending",
      },
    ],
  };

  documents.push(newDocument);
  saveDocuments(documents);
  return newDocument;
}
