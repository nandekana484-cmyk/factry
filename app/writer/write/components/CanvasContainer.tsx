"use client";

import React from "react";

interface CanvasContainerProps {
  children: React.ReactNode;
}

export default function CanvasContainer({ children }: CanvasContainerProps) {
  return (
    <div className="flex-1 overflow-auto relative flex justify-center items-start py-16 px-20">
      {children}
    </div>
  );
}