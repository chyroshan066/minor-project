"use client";

import { useEffect, useRef } from "react";
import PerfectScrollbarLib from "perfect-scrollbar";

interface UseScrollbarOptions {
  wheelSpeed?: number;
  wheelPropagation?: boolean;
  swipeEasing?: boolean;
  minScrollbarLength?: number;
  maxScrollbarLength?: number;
  scrollingThreshold?: number;
  useBothWheelAxes?: boolean;
  suppressScrollX?: boolean;
  suppressScrollY?: boolean;
  scrollXMarginOffset?: number;
  scrollYMarginOffset?: number;
}

type PerfectScrollbarInstance = Omit<PerfectScrollbar, "destroy"> & {
  destroy: () => void;
  update: () => void;
};

interface PerfectScrollbarConstructor {
  new (
    element: HTMLElement,
    options?: UseScrollbarOptions
  ): PerfectScrollbarInstance;
}

export const useScrollbar = (options: UseScrollbarOptions = {}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const psRef = useRef<PerfectScrollbarInstance | null>(null);

  useEffect(() => {
    if (containerRef.current) {
      // Cast the imported value to the explicit constructor interface
      const PsConstructor =
        PerfectScrollbarLib as unknown as PerfectScrollbarConstructor;

      // Initialize Perfect Scrollbar
      psRef.current = new PsConstructor(containerRef.current, {
        wheelSpeed: 2,
        wheelPropagation: false,
        minScrollbarLength: 20,
        ...options,
      });

      // Cleanup on unmount
      return () => {
        if (psRef.current) {
          psRef.current.destroy();
          psRef.current = null;
        }
      };
    }
  }, [options]);

  // Method to manually update scrollbar
  const updateScrollbar = () => {
    if (psRef.current) {
      psRef.current.update();
    }
  };

  return { containerRef, updateScrollbar };
};
