"use client";

import React from "react";

interface ScaledCanvasProps {
  children: React.ReactNode;
  zoom: number;
}

export default function ScaledCanvas({ children, zoom }: ScaledCanvasProps) {
  // WriterCanvasのzoomスケールのみ
  return (
    <div
      style={{
        transform: `scale(${zoom})`,
        transformOrigin: "top left",
      }}
    >
      {children}
    </div>
  );
}