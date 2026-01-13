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
      className="w-64 border-r overflow-y-auto"
      data-ignore-deselect="true"
    >
      <FieldPalette
        onAdd={(type, role) => {
          editor.addBlock(type, role);
          setIsDirty(true);
        }}
      />
    </div>
  );
}
