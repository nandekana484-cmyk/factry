"use client";

import FieldPalette from "@/components/FieldPalette";

interface LeftSidebarProps {
  editor: any;
  setIsDirty: (dirty: boolean) => void;
}

/**
 * LeftSidebar
 * 左側のFieldPaletteを担当
 */
export function LeftSidebar({ editor, setIsDirty }: LeftSidebarProps) {
  return (
    <div
      className="border-r flex flex-col h-full flex-1"
      style={{
        width: "260px",
        flex: "0 0 260px",
        minWidth: "260px",
        maxWidth: "260px"
      }}
      data-ignore-deselect="true"
    >
      {/* 固定表示：タイトル・サブタイトル・管理番号・承認印追加ボタン群 */}
      <div className="p-4 border-b bg-white space-y-2">
        <div className="text-lg font-bold text-gray-600 mt-3 mb-1">タイトル追加</div>
        <div className="text-xs font-bold text-gray-600 mt-3 mb-1">1テンプレートに1つ設置します</div>
        <button
          onClick={() => {
            editor.addBlock("titlePlaceholder");
            setIsDirty(true);
          }}
          className="w-full px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition font-medium"
        >
          タイトル追加
        </button>
        <div className="text-xs font-bold text-gray-600 mt-3 mb-1">→ファイル名になります。ここでは記入しません</div>
        <button
          onClick={() => {
            editor.addBlock("subtitlePlaceholder");
            setIsDirty(true);
          }}
          className="w-full px-4 py-2 bg-indigo-400 text-white rounded hover:bg-indigo-500 transition font-medium"
        >
          サブタイトル追加
        </button>
        <div className="text-xs font-bold text-gray-600 mt-3 mb-1">→ファイル種類になります”報告書など”</div>
        <button
          onClick={() => {
            editor.addBlock("managementNumberPlaceholder");
            setIsDirty(true);
          }}
          className="w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition font-medium"
        >
          管理番号追加
        </button>
        <div className="text-xs font-bold text-gray-600 mt-3 mb-1">→文書の管理番号プレースホルダー</div>
        <div className="text-lg font-bold text-gray-600 mt-3 mb-1">承認印追加</div>
        <button
          onClick={() => {
            editor.addBlock("approvalStampPlaceholder", "creator");
            setIsDirty(true);
          }}
          className="w-full px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition text-sm"
        >
          作成者印
        </button>
        <button
          onClick={() => {
            editor.addBlock("approvalStampPlaceholder", "checker");
            setIsDirty(true);
          }}
          className="w-full px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition text-sm"
        >
          確認者印
        </button>
        <button
          onClick={() => {
            editor.addBlock("approvalStampPlaceholder", "approver");
            setIsDirty(true);
          }}
          className="w-full px-3 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition text-sm"
        >
          承認者印
        </button>
      </div>
      {/* スクロール部分：図形パレット */}
      <div className="flex-1 overflow-y-auto">
        <FieldPalette
          onAdd={(type, role) => {
            editor.addBlock(type, role);
            setIsDirty(true);
          }}
          onAddImage={(imageData) => {
            editor.addImageBlock(imageData);
            setIsDirty(true);
          }}
        />
      </div>
    </div>
  );
}
