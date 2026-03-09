"use client";

import PaperCanvas from "../write/components/PaperCanvas";

const sizes = {
  A4: { w: 794, h: 1123 },
  A3: { w: 1123, h: 1587 },
};

type Block = {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  page?: number;
  [key: string]: any;
};

type PreviewCanvasProps = {
  blocks: Block[];
  paper: "A4" | "A3";
  orientation: "portrait" | "landscape";
  currentPage: number;
};

export default function PreviewCanvas({
  blocks,
  paper,
  orientation,
  currentPage,
}: PreviewCanvasProps) {
  console.log("PreviewCanvas paper:", paper);
  console.log("PreviewCanvas orientation:", orientation);

  const base = sizes[paper] ?? sizes["A4"];
  const width = orientation === "portrait" ? base.w : base.h;
  const height = orientation === "portrait" ? base.h : base.w;

  const transformedBlocks =
    orientation === "portrait"
      ? blocks
      : blocks.map((b) => ({
          ...b,
          x: b.y,
          y: b.x,
          width: b.height,
          height: b.width,
        }));

  return (
    <div
      style={{
        width,
        height,
        position: "relative",
        background: "white",
      }}
    >
      <PaperCanvas
        width={width}
        height={height}
        blocks={transformedBlocks}
        readOnly={true}
        showGrid={false}
        gridSize={20}
        selectedBlock={null}
        onSelectBlock={() => {}}
        onUpdateBlock={() => {}}
        snap={() => ({ x: 0, y: 0 })}
        currentPage={currentPage}
        onDoubleClickBlock={() => {}}
      />
    </div>
  );
}