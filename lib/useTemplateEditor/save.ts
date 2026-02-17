import type { Page } from "./types";

export function useSaveActions(state: any) {
  const { pages, paper, orientation, currentTemplateId, setCurrentTemplateId, setBlocks, setPages, setCurrentPage, setSelectedBlock, setSelectedCell } = state;

  // テンプレート新規保存
  const saveTemplateAsNew = async (template: any) => {
    const res = await fetch("/api/templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(template),
      credentials: "include",
    });
    if (!res.ok) throw new Error("テンプレート新規保存に失敗しました");
    const data = await res.json();
    setCurrentTemplateId(data.id || null);
    return data;
  };

  // テンプレート上書き保存
  const saveTemplateOverwrite = async (template: any) => {
    if (!currentTemplateId) throw new Error("テンプレートIDがありません");
    const res = await fetch(`/api/templates/${currentTemplateId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(template),
      credentials: "include",
    });
    if (!res.ok) throw new Error("テンプレート上書き保存に失敗しました");
    return await res.json();
  };

  return {
    saveTemplateAsNew,
    saveTemplateOverwrite,
  };
}
