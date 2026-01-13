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
      <FieldPalette
        onAdd={(type, role) => {
          editor.addBlock(type, role);
          setIsDirty(true);
        }}
      />
    </div>
  );
}
