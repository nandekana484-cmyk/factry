"use client";

import EditorContainer from "@/components/EditorContainer";

interface TemplateCanvasProps {
  editor: any;
  setIsDirty: (dirty: boolean) => void;
  onSaveTemplate: () => void;
  onNewTemplate: () => void;
}

/**
 * TemplateCanvas
 * EditorContainerをラップしてTemplateCreatePageから切り離す
 */
export default function TemplateCanvas({
  editor,
  setIsDirty,
  onSaveTemplate,
  onNewTemplate,
}: TemplateCanvasProps) {
  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      <EditorContainer
        blocks={editor.blocks}
        selectedBlock={editor.selectedBlock}
        updateBlock={(id: string, updated: any) => {
          editor.updateBlock(id, updated);
          setIsDirty(true);
        }}
        selectBlock={editor.selectBlock}
        deleteBlock={(id: string) => {
          editor.deleteBlock(id);
          setIsDirty(true);
        }}
        selectedCell={editor.selectedCell}
        setSelectedCell={editor.setSelectedCell}
        onSaveTemplate={onSaveTemplate}
        onNewTemplate={onNewTemplate}
        // UI状態管理
        paper={editor.paper}
        setPaper={editor.setPaper}
        orientation={editor.orientation}
        setOrientation={editor.setOrientation}
        showGrid={editor.showGrid}
        setShowGrid={editor.setShowGrid}
        zoom={editor.zoom}
        setZoom={editor.setZoom}
        gridSize={editor.gridSize}
        setGridSize={editor.setGridSize}
        snapMode={editor.snapMode}
        setSnapMode={editor.setSnapMode}
      />
    </div>
  );
}
