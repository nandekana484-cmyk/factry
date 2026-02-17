import { useCallback } from "react";
import type { Block } from "./types";

export function useTemplateActions(state: any) {
  const { setBlocks, setPages, setCurrentPage, setSelectedBlock, setSelectedCell, setPaper, setOrientation, setCurrentTemplateId } = state;

  // テンプレート読み込み（全ブロック editable:true, locked:false, source:"template"）
  const loadTemplate = useCallback(async (templateId: string) => {
    if (typeof window === "undefined") return;
    try {
      const res = await fetch(`/api/templates/${templateId}`, { credentials: "include" });
      if (!res.ok) {
        console.warn(`[loadTemplate] API returned status ${res.status}`);
        return;
      }
      const data = await res.json();
      const template = data.template;
      if (!template || !template.content) {
        console.warn("[loadTemplate] template or content invalid:", template);
        return;
      }
      const parsed = template.content;
      const blocks: Block[] = (parsed.blocks || []).map((b: any) => ({
        ...b,
        locked: false,
        editable: true,
        source: "template",
      }));
      setBlocks(blocks);
      setPages([{ id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(), number: 1, blocks }]);
      setCurrentPage(1);
      setSelectedBlock(null);
      setSelectedCell(null);
      setPaper(parsed.paper || "A4");
      setOrientation(parsed.orientation || "portrait");
      setCurrentTemplateId(templateId);
      console.log("[loadTemplate] blocks applied:", blocks);
    } catch (e) {
      console.error("[loadTemplate] fetch or parse error:", e);
    }
  }, [setBlocks, setPages, setCurrentPage, setSelectedBlock, setSelectedCell, setPaper, setOrientation, setCurrentTemplateId]);

  // テンプレート保存（新規/上書き）
  const saveTemplate = useCallback(async (template: any, overwrite = false) => {
    const url = overwrite && template.id ? `/api/templates/${template.id}` : "/api/templates";
    const method = overwrite && template.id ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(template),
      credentials: "include",
    });
    if (!res.ok) {
      throw new Error("テンプレート保存に失敗しました");
    }
    return await res.json();
  }, []);

  return { loadTemplate, saveTemplate };
}
