"use client";

import React from "react";

interface ScaledCanvasProps {
  children: React.ReactNode;
  zoom: number;
  className?: string;
}

export default function ScaledCanvas({ children, zoom, className }: ScaledCanvasProps) {
  return (
    <div
      className={className}
      style={{
        transform: `scale(${zoom})`,
        transformOrigin: "top left",

        // ★ ズーム後の実寸サイズを補正（ズレ解消の本質）
        width: `${100 / zoom}%`,
        height: `${100 / zoom}%`,

        // レイアウト安定化
        display: "inline-block",
      }}
    >
      {children}
    </div>
  );
}