"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export const useDisclosure = (initialState = false) => {
  const [isOpen, setIsOpen] = useState(initialState);
  const contentRef = useRef<HTMLElement | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  // Handle dropdown toggle
  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;

      if (
        isOpen &&
        contentRef.current &&
        !contentRef.current.contains(target) &&
        (!triggerRef.current || !triggerRef.current.contains(target))
      ) {
        close();
      }
    };

    window.addEventListener("click", handleClickOutside);

    return () => window.removeEventListener("click", handleClickOutside);
  }, [isOpen, close]);

  return {
    isOpen,
    toggle,
    close,
    open,
    contentRef,
    triggerRef,
  };
};
