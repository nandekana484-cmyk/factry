"use client";

import { useEffect } from "react";
import TextBlock from "@/components/TextBlock";
import ShapeBlock from "@/components/ShapeBlock";
import PlaceholderBlock from "@/components/PlaceholderBlock";

interface WriterCanvasProps {
  blocks: any[];
  selectedBlock: any;
  onUpdateBlock: (id: string, updated: any) => void;
  onSelectBlock: (id: string | null) => void;
}

/**
 * WriterCanvas
 * 中央のブロック描画エリアを担当
 */
export default function WriterCanvas({
  blocks,
  selectedBlock,
  onUpdateBlock,
  onSelectBlock,
}: WriterCanvasProps) {
  // グローバルクリックリスナーでキャンバス外クリックも選択解除
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // data-block-idを持つ要素（ブロック）をクリックした場合は何もしない
      if (target.closest('[data-block-id]')) {
        return;
      }
      
      // data-ignore-deselectを持つ要素（UIボタンなど）をクリックした場合は何もしない
      if (target.closest('[data-ignore-deselect]')) {
        return;
      }
      
      // 上記以外の場合は選択解除
      onSelectBlock(null);
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onSelectBlock]);

  return (
    <div className="flex-1 overflow-auto bg-gray-100 p-8">
      <div
        className="bg-white shadow-lg mx-auto"
        style={{
          width: "794px",
          minHeight: "1123px",
          position: "relative",
        }}
      >
        {blocks.map((block: any) => {
          const isSelected = selectedBlock?.id === block.id;
          const isTextBlock = ["text", "titlePlaceholder"].includes(block.type);
          const isPlaceholder = ["approvalStampPlaceholder", "managementNumberPlaceholder"].includes(block.type);

          return isTextBlock ? (
            <TextBlock
              key={block.id}
              block={block}
              isSelected={isSelected}
              selectedBlock={selectedBlock}
              updateBlock={onUpdateBlock}
              selectBlock={onSelectBlock}
              snap={(value: number) => Math.round(value)}
              isReadOnly={true}
            />
          ) : isPlaceholder ? (
            <PlaceholderBlock
              key={block.id}
              block={block}
              isSelected={isSelected}
              updateBlock={onUpdateBlock}
              selectBlock={onSelectBlock}
              snap={(value: number) => Math.round(value)}
              isReadOnly={true}
            />
          ) : (
            <ShapeBlock
              key={block.id}
              block={block}
              blocks={blocks}
              isSelected={isSelected}
              updateBlock={onUpdateBlock}
              selectBlock={onSelectBlock}
              snap={(value: number) => Math.round(value)}
              isReadOnly={true}
            />
          );
        })}
      </div>
    </div>
  );
}
