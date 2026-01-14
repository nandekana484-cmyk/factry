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
      className="border-r overflow-y-auto"
      style={{
        width: "260px",
        flex: "0 0 260px",
        minWidth: "260px",
        maxWidth: "260px"
      }}
      data-ignore-deselect="true"
    >
      {/* 特別なボタン（タイトル・承認印） */}
      <div className="p-4 border-b bg-white space-y-2">
        <button
          onClick={() => {
            editor.addBlock("titlePlaceholder");
            setIsDirty(true);
          }}
          className="w-full px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition font-medium"
        >
          タイトル追加
        </button>
        
        <button
          onClick={() => {
            editor.addBlock("subtitlePlaceholder");
            setIsDirty(true);
          }}
          className="w-full px-4 py-2 bg-indigo-400 text-white rounded hover:bg-indigo-500 transition font-medium"
        >
          サブタイトル追加
        </button>
        
        <div className="text-xs font-bold text-gray-600 mt-3 mb-1">承認印追加</div>
        
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

      {/* 図形パレット */}
      <FieldPalette
        onAdd={(type, role) => {
          editor.addBlock(type, role);
          setIsDirty(true);
        }}
      />
    </div>
  );
}
