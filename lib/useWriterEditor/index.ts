import { useWriterEditorState } from "./state";
import { useBlockActions } from "./blocks";
import { usePageActions } from "./pages";
import { useTemplateActions } from "./template";
import { useHistoryActions } from "./history";
import { useSaveActions } from "./save";
import type { Block, Page } from "./types";

function useWriterEditor(options?: { readOnly?: boolean }) {
  // 状態定義
  const state = useWriterEditorState();

  // Undo/Redo
  const history = useHistoryActions(state);
  // ページ操作
  const pages = usePageActions({ ...state, ...history });
  // ブロック操作
  const blocks = useBlockActions({ ...state, ...pages });
  // テンプレート操作
  const template = useTemplateActions(state);
  // 保存系
  const save = useSaveActions({ ...state, ...pages });

  return {
    ...state,
    ...history,
    ...pages,
    ...blocks,
    ...template,
    ...save,
    canUndo: state.historyIndex > 0,
    canRedo: state.historyIndex < state.history.length - 1,
  };
}

export default useWriterEditor;
export type { Block, Page };
