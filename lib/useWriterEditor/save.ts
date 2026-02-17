import type { Page } from "./types";

export function useSaveActions(state: any) {
  const { pages, paper, orientation, currentDocumentId, setCurrentDocumentId, setBlocks, setPages, setCurrentPage, setSelectedBlock, setSelectedCell } = state;

  // 文書保存
  const saveDocument = (title: string, status: "draft" | "submitted" = "draft") => {
    const document = {
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(),
      title,
      status,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      pages: JSON.parse(JSON.stringify(pages)),
    };
    const existing = JSON.parse(localStorage.getItem("documents") || "[]");
    const updated = [...existing, document];
    localStorage.setItem("documents", JSON.stringify(updated));
    return document ?? null;
  };

  // 下書き保存
  const saveDraft = (title: string) => {
    const document = saveDocument(title, "draft");
    setCurrentDocumentId(document?.id ?? null);
    return document;
  };

  // 下書き上書き保存
  const overwriteDraft = (title: string) => {
    if (!currentDocumentId) {
      return saveDraft(title);
    }
    const document: any = {
      id: currentDocumentId,
      title,
      status: "draft",
      date: new Date().toISOString(),
      pages,
      paper,
      orientation,
    };
    const existing = JSON.parse(localStorage.getItem("documents") || "[]");
    const index = existing.findIndex((doc: any) => doc.id === currentDocumentId);
    if (index !== -1) {
      existing[index] = document;
    } else {
      existing.push(document);
    }
    localStorage.setItem("documents", JSON.stringify(existing));
    return document;
  };

  // 文書提出
  const submitDocument = (title: string) => {
    return saveDocument(title, "submitted");
  };

  // 下書き読み込み
  const loadDraft = (draft: any) => {
    setCurrentDocumentId(draft.id || null);
    if (draft.pages) {
      setPages(draft.pages);
      setCurrentPage(1);
      setBlocks([...draft.pages[0].blocks]);
      setSelectedBlock(null);
      setSelectedCell(null);
      return draft.pages[0].blocks;
    } else {
      setPages([{ id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(), number: 1, blocks: draft.blocks || [] }]);
      setCurrentPage(1);
      setBlocks(draft.blocks || []);
      setSelectedBlock(null);
      setSelectedCell(null);
      return draft.blocks || [];
    }
  };

  return {
    saveDocument,
    saveDraft,
    overwriteDraft,
    submitDocument,
    loadDraft,
  };
}
