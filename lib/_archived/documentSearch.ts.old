import { Document, DocumentVersion } from "./folderManagement";

/**
 * 文書データをAI検索用にインデックス化する
 * 将来的にベクトル検索などを実装する際に使用
 */
export interface SearchIndex {
  docId: string;
  aiIndexId: string; // AI検索用の一意ID
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

/**
 * 文書をSearchIndexに変換
 */
export function createSearchIndex(doc: Document): SearchIndex[] {
  return doc.versions.map((version: DocumentVersion) => ({
    docId: doc.id,
    aiIndexId: doc.aiIndexId,
    managementNumber: doc.managementNumber,
    title: doc.title,
    fullText: version.fullText,
    metadata: {
      templateId: doc.templateId,
      creator: doc.creator,
      createdAt: doc.createdAt,
      hierarchy: doc.folderPath,
    },
    versionId: version.id,
    versionNumber: version.versionNumber,
  }));
}

/**
 * 複数の文書からSearchIndexを作成
 */
export function createSearchIndexes(documents: Document[]): SearchIndex[] {
  return documents.flatMap((doc) => createSearchIndex(doc));
}

/**
 * キーワードで文書を検索（簡易的なテキスト検索）
 * 将来的にはベクトル検索に置き換える
 */
export function searchDocuments(
  documents: Document[],
  keyword: string
): Document[] {
  const lowerKeyword = keyword.toLowerCase();

  return documents.filter((doc) => {
    // タイトルで検索
    if (doc.title.toLowerCase().includes(lowerKeyword)) {
      return true;
    }

    // 管理番号で検索
    if (doc.managementNumber.toLowerCase().includes(lowerKeyword)) {
      return true;
    }

    // 全文で検索
    if (doc.fullText.toLowerCase().includes(lowerKeyword)) {
      return true;
    }

    // 作成者で検索
    if (doc.creator.toLowerCase().includes(lowerKeyword)) {
      return true;
    }

    return false;
  });
}

/**
 * aiIndexIdで文書を検索（AI回答時に参照文書を特定）
 */
export function findDocumentByAiIndexId(
  documents: Document[],
  aiIndexId: string
): Document | null {
  return documents.find((doc) => doc.aiIndexId === aiIndexId) || null;
}

/**
 * AI回答結果をまとめるデータ構造
 */
export interface AiAnswer {
  content: string; // AI生成回答
  references: AiReference[]; // 参照文書
  timestamp: string;
  model?: string; // 使用モデル
}

export interface AiReference {
  aiIndexId: string;
  managementNumber: string;
  title: string;
  docId: string;
  relevanceScore?: number; // 関連度スコア（0-1）
  excerpt?: string; // 参照部分の抜粋
}

/**
 * AiReferenceから詳細画面へのリンクを生成
 */
export function generateDocumentLink(ref: AiReference): string {
  return `/dashboard/documents/${ref.docId}?indexId=${ref.aiIndexId}`;
}

/**
 * AI検索インデックスを生成（将来的にベクトル検索DBに送信）
 */
export function prepareForVectorSearch(indexes: SearchIndex[]): any[] {
  return indexes.map((index) => ({
    id: index.aiIndexId,
    docId: index.docId,
    managementNumber: index.managementNumber,
    title: index.title,
    content: index.fullText,
    metadata: {
      ...index.metadata,
      versionId: index.versionId,
      versionNumber: index.versionNumber,
    },
    // 将来: これらをEmbeddingに変換
    // embedding: await generateEmbedding(index.fullText),
  }));
}

/**
 * 文書の最新版を取得
 */
export function getLatestVersion(doc: Document): DocumentVersion | null {
  if (!doc.versions || doc.versions.length === 0) {
    return null;
  }

  return doc.versions.reduce((latest, current) => {
    return current.versionNumber > latest.versionNumber ? current : latest;
  });
}

/**
 * 特定の日付範囲の文書を取得
 */
export function filterByDateRange(
  documents: Document[],
  startDate: Date,
  endDate: Date
): Document[] {
  return documents.filter((doc) => {
    const docDate = new Date(doc.createdAt);
    return docDate >= startDate && docDate <= endDate;
  });
}

/**
 * テンプレートごとに文書をグループ化
 */
export function groupByTemplate(
  documents: Document[]
): Record<string, Document[]> {
  const grouped: Record<string, Document[]> = {};

  documents.forEach((doc) => {
    if (!grouped[doc.templateId]) {
      grouped[doc.templateId] = [];
    }
    grouped[doc.templateId].push(doc);
  });

  return grouped;
}

/**
 * 作成者ごとに文書をグループ化
 */
export function groupByCreator(
  documents: Document[]
): Record<string, Document[]> {
  const grouped: Record<string, Document[]> = {};

  documents.forEach((doc) => {
    if (!grouped[doc.creator]) {
      grouped[doc.creator] = [];
    }
    grouped[doc.creator].push(doc);
  });

  return grouped;
}

/**
 * ステータスごとに文書をグループ化
 */
export function groupByStatus(
  documents: Document[]
): Record<string, Document[]> {
  const grouped: Record<string, Document[]> = {};

  documents.forEach((doc) => {
    if (!grouped[doc.status]) {
      grouped[doc.status] = [];
    }
    grouped[doc.status].push(doc);
  });

  return grouped;
}

/**
 * 文書統計を取得
 */
export interface DocumentStats {
  totalCount: number;
  byStatus: Record<string, number>;
  byTemplate: Record<string, number>;
  byCreator: Record<string, number>;
  avgVersionsPerDoc: number;
  totalFullTextSize: number;
}

export function getDocumentStats(documents: Document[]): DocumentStats {
  const byStatus: Record<string, number> = {};
  const byTemplate: Record<string, number> = {};
  const byCreator: Record<string, number> = {};

  let totalVersions = 0;
  let totalFullTextSize = 0;

  documents.forEach((doc) => {
    // ステータス
    byStatus[doc.status] = (byStatus[doc.status] || 0) + 1;

    // テンプレート
    byTemplate[doc.templateId] = (byTemplate[doc.templateId] || 0) + 1;

    // 作成者
    byCreator[doc.creator] = (byCreator[doc.creator] || 0) + 1;

    // バージョン数
    totalVersions += doc.versions.length;

    // 全文サイズ
    totalFullTextSize += doc.fullText.length;
  });

  return {
    totalCount: documents.length,
    byStatus,
    byTemplate,
    byCreator,
    avgVersionsPerDoc:
      documents.length > 0 ? totalVersions / documents.length : 0,
    totalFullTextSize,
  };
}
