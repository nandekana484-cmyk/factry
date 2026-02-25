import { useCallback } from "react";
import type { Block } from "./types";

export function useTemplateActions(state: any) {
  const {
    setBlocks,
    setPages,
    setCurrentPage,
    setSelectedBlock,
    setSelectedCell,
    setPaper,
    setOrientation,
    setCurrentTemplateId,
    paper,
    orientation,
    blocks,
    currentTemplateId,
  } = state;

  // -----------------------------
  // テンプレート読み込み
  // -----------------------------
  const loadTemplate = useCallback(async (templateId: string) => {
    if (typeof window === "undefined") return;
    try {
      const res = await fetch(`/api/templates/${templateId}`, { credentials: "include" });
      if (!res.ok) return;
      const data = await res.json();
      const template = data.template;
      if (!template || !template.content) return;
      const parsed = template.content;
      const loadedBlocks: Block[] = (parsed.blocks || []).map((b: any) => ({
        x: 100,
        y: 100,
        width: 200,
        height: 80,
        rotate: 0,
        ...b,
        locked: false,
        editable: true,
        source: "template",
      }));
      setBlocks(loadedBlocks);
      setPages([
        {
          id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(),
          number: 1,
          blocks: loadedBlocks,
        },
      ]);
      setCurrentPage(1);
      setSelectedBlock(null);
      setSelectedCell(null);
      setPaper(parsed.paper || "A4");
      setOrientation(parsed.orientation || "portrait");
      setCurrentTemplateId(templateId);
    } catch (e) {
      console.error("[loadTemplate] error:", e);
    }
  }, [setBlocks, setPages, setCurrentPage, setSelectedBlock, setSelectedCell, setPaper, setOrientation, setCurrentTemplateId]);

  // -----------------------------
  // テンプレート保存（新規 / 上書き）
  // -----------------------------
  const saveTemplate = useCallback(
    async (templateName: string, overwrite = false) => {
      // blocksを唯一のソースとして保存
      const content = {
        blocks,
        paper,
        orientation,
      };
      const template = {
        id: overwrite ? currentTemplateId : undefined,
        name: templateName,
        content,
      };
      console.log("Saving template:", template); // blocks内容を確認
      const url =
        overwrite && currentTemplateId
          ? `/api/templates/${currentTemplateId}`
          : "/api/templates";
      const method = overwrite && currentTemplateId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(template),
        credentials: "include",
      });
      if (!res.ok) {
        const text = await res.text();
        console.error("SAVE TEMPLATE ERROR:", text);
        throw new Error("テンプレート保存に失敗しました");
      }
      const data = await res.json();
      if (!overwrite) {
        setCurrentTemplateId(data.template?.id || null);
      }
      return data;
    },
    [blocks, paper, orientation, currentTemplateId, setCurrentTemplateId]
  );

  return { loadTemplate, saveTemplate };
}