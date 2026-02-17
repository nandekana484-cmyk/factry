import { useCallback } from "react";
import type { Block } from "./types";

export function useTemplateActions(state: any) {
  const { setBlocks, setPages, setCurrentPage, setSelectedBlock, setSelectedCell, setPaper, setOrientation, setSelectedTemplateId } = state;

  // テンプレート読み込み
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
      // テンプレート由来ブロックには必ずlocked:true, source:'template', editable:(タイトル系のみtrue)を付与
      const lockedBlocks: Block[] = (parsed.blocks || []).map((b: any) => ({
        ...b,
        locked: true,
        source: "template",
        editable: b.type === "titlePlaceholder" || b.type === "subtitlePlaceholder" ? true : false,
      }));
      setBlocks(lockedBlocks);
      setPages([{ id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(), number: 1, blocks: lockedBlocks }]);
      setCurrentPage(1);
      setSelectedBlock(null);
      setSelectedCell(null);
      setPaper(parsed.paper || "A4");
      setOrientation(parsed.orientation || "portrait");
      setSelectedTemplateId(templateId);
      console.log("[loadTemplate] blocks applied:", lockedBlocks);
    } catch (e) {
      console.error("[loadTemplate] fetch or parse error:", e);
    }
  }, [setBlocks, setPages, setCurrentPage, setSelectedBlock, setSelectedCell, setPaper, setOrientation, setSelectedTemplateId]);

  return { loadTemplate };
}
