import type { Block } from "@/types/document";

interface Props {
  blocks: Block[];
}

export function ApproverPreviewBlocks({ blocks }: Props) {
  if (blocks.length === 0) return <p className="text-gray-500">ブロックがありません</p>;
  return (
    <div className="space-y-3">
      {blocks.map((block) => (
        <div key={block.id} className="border rounded p-3">
          {block.type === "text" || block.type === "title" ? (
            <p className="text-gray-900">{block.text || "（空）"}</p>
          ) : block.type === "image" ? (
            block.src ? (
              <img src={block.src} alt="Document image" className="max-w-full h-auto" />
            ) : (
              <div className="text-gray-500">画像なし</div>
            )
          ) : (
            <div className="text-gray-500 text-sm">{block.type} ブロック</div>
          )}
        </div>
      ))}
    </div>
  );
}