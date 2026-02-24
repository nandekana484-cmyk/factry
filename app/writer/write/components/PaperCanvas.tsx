"use client";

import React, { forwardRef } from "react";
import TextBlock from "@/components/TextBlock";
import ShapeBlock from "@/components/ShapeBlock";
import PlaceholderBlock from "@/components/PlaceholderBlock";

interface PaperCanvasProps {
  width: number;
  height: number;
  showGrid: boolean;
  gridSize: number;
  offsetX?: number;
  offsetY?: number;
  blocks: any[];
  selectedBlock: any;
  onSelectBlock: (id: string | null) => void;
  onUpdateBlock: (id: string, updates: any) => void;
  readOnly?: boolean;
  currentPage?: number;
  snap?: (x: number, y: number) => { x: number; y: number };
  onDoubleClickBlock?: () => void;
}

const PaperCanvas = React.forwardRef<HTMLDivElement, PaperCanvasProps>(
  (
    {
      width,
      height,
      showGrid,
      gridSize,
      offsetX = 0,
      offsetY = 0,
      blocks,
      selectedBlock,
      onSelectBlock,
      onUpdateBlock,
      readOnly = false,
      currentPage,
      snap,
      onDoubleClickBlock,
    },
    ref
  ) => {
    const pageBlocks = blocks.filter((b) => (b.page ?? 1) === currentPage);

    return (
      <div
        ref={ref}
        className="bg-white shadow-lg relative"
        style={{
          width: `${width}px`,
          height: `${height}px`,
          border: "1px solid #ccc",
          backgroundImage: showGrid
            ? `linear-gradient(#e5e5e5 1px, transparent 1px),
               linear-gradient(90deg, #e5e5e5 1px, transparent 1px)`
            : "none",
          backgroundSize: showGrid
            ? `${Math.round(gridSize)}px ${Math.round(gridSize)}px`
            : "none",
          backgroundPosition: showGrid ? `${offsetX}px ${offsetY}px` : "none",
          backgroundAttachment: "local",
        }}
      >
        {pageBlocks.map((block: any) => {
          const isSelected = selectedBlock?.id === block.id;
          const isTextBlock = ["text", "titlePlaceholder", "subtitlePlaceholder"].includes(block.type);
          const isPlaceholder = ["approvalStampPlaceholder", "managementNumberPlaceholder"].includes(block.type);

          if (isTextBlock) {
            return (
              <TextBlock
                key={block.id}
                block={block}
                isSelected={isSelected}
                selectedBlock={selectedBlock}
                updateBlock={onUpdateBlock}
                selectBlock={onSelectBlock}
                snap={snap}
                isReadOnly={readOnly || block.locked === true}
                isTextEditable={block.locked !== true}
                onDoubleClick={() => {
                  onSelectBlock(block.id);
                  onDoubleClickBlock?.();
                }}
              />
            );
          }

          if (isPlaceholder) {
            return (
              <PlaceholderBlock
                key={block.id}
                block={block}
                isSelected={isSelected}
                updateBlock={onUpdateBlock}
                selectBlock={onSelectBlock}
                snap={snap}
                isReadOnly={readOnly || block.locked === true}
                currentPage={currentPage}
                onDoubleClick={() => {
                  onSelectBlock(block.id);
                  onDoubleClickBlock?.();
                }}
              />
            );
          }

          return (
            <ShapeBlock
              key={block.id}
              block={block}
              blocks={pageBlocks}
              isSelected={isSelected}
              updateBlock={onUpdateBlock}
              selectBlock={onSelectBlock}
              snap={snap}
              isReadOnly={readOnly || block.locked === true}
              onDoubleClick={() => {
                onSelectBlock(block.id);
                onDoubleClickBlock?.();
              }}
            />
          );
        })}
      </div>
    );
  }
);

export default PaperCanvas;