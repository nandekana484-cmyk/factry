"use client";

import React from "react";

interface CanvasContainerProps {
  children: React.ReactNode;
}

export default function CanvasContainer({ children }: CanvasContainerProps) {
  return (
    <div className="canvas-container flex-1 overflow-auto relative flex justify-center items-start py-8 px-10">
      {children}
    </div>
  );
}