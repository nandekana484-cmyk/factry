/**
 * 文書検索機能の型定義
 * 
 * ⚠️ 注意: LocalStorageベースの実装は lib/_archived/documentSearch.ts.old に移動しました
 * 新しいシステムでは Prisma + API ベースの実装を使用してください。
 */

import { Document, DocumentVersion } from "./folderManagement";

export interface SearchIndex {
  docId: string;
  aiIndexId: string;
  managementNumber: string;
  title: string;
  fullText: string;
  metadata: {
    templateId: string;
    creator: string;
    createdAt: string;
    hierarchy: string[];
  };
  versionId: string;
  versionNumber: number;
}

export interface AiAnswer {
  content: string;
  references: AiReference[];
  timestamp: string;
  model?: string;
}

export interface AiReference {
  aiIndexId: string;
  managementNumber: string;
  title: string;
  docId: string;
  relevanceScore?: number;
  excerpt?: string;
}

// 以下の関数は LocalStorage ベースの古い実装です
// lib/_archived/documentSearch.ts.old を参照してください
//
// - createSearchIndex()
// - createSearchIndexes()
// - searchDocuments()
// - findDocumentByAiIndexId()
// - generateDocumentLink()
// - prepareForVectorSearch()
// - getLatestVersion()

/**
 * ⚠️ 以下の関数を使用しないでください
 * 代わりに以下のAPIを使用してください:
 * 
 * - GET /api/search?q=keyword - 文書検索
 */

export function createSearchIndex(doc: Document): SearchIndex[] {
  throw new Error("createSearchIndex() is deprecated. Use GET /api/search instead.");
}

export function createSearchIndexes(documents: Document[]): SearchIndex[] {
  throw new Error("createSearchIndexes() is deprecated. Use GET /api/search instead.");
}

export function searchDocuments(documents: Document[], keyword: string): Document[] {
  throw new Error("searchDocuments() is deprecated. Use GET /api/search?q=keyword instead.");
}

export function findDocumentByAiIndexId(documents: Document[], aiIndexId: string): Document | null {
  throw new Error("findDocumentByAiIndexId() is deprecated.");
}

export function generateDocumentLink(ref: AiReference): string {
  throw new Error("generateDocumentLink() is deprecated.");
}

export function prepareForVectorSearch(indexes: SearchIndex[]): any[] {
  throw new Error("prepareForVectorSearch() is deprecated.");
}

export function getLatestVersion(doc: Document): DocumentVersion | null {
  throw new Error("getLatestVersion() is deprecated.");
}
