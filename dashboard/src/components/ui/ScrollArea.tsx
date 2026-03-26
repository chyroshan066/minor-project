"use client";

import { useScrollbar } from "@/hooks/useScrollbar";
import { useEffect, useMemo } from "react";
import "perfect-scrollbar/css/perfect-scrollbar.css";

interface ScrollAreaProps {
  children: React.ReactNode;
  className?: string;
  options?: any; // Simplified for now, or use your detailed type
  style?: React.CSSProperties;
}

export const ScrollArea = ({
  children,
  className = "",
  options = {},
  style = {},
}: ScrollAreaProps) => {
  // Merge default options to allow page scrolling when table reaches end
  const mergedOptions = useMemo(() => ({
    wheelSpeed: 1,
    wheelPropagation: true, // IMPORTANT: This allows the page to scroll
    suppressScrollX: false,
    ...options
  }), [options]);

  const { containerRef, updateScrollbar } = useScrollbar(mergedOptions);

  useEffect(() => {
    updateScrollbar();
  }, [children, updateScrollbar]);

  return (
    <div
      ref={containerRef}
      className={`perfect-scrollbar-container ${className}`}
      style={{ 
        position: "relative", 
        overflow: "hidden", // Required for Perfect Scrollbar to work
        ...style 
      }}
    >
      {children}
    </div>
  );
};