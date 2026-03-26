"use client";

import { Provider } from "react-redux";
import { AppStore, makeStore } from "./store";
import { useRef } from "react";
import { setupListeners } from "@reduxjs/toolkit/query";
import { Children } from "@/types";

export const Providers = ({ children }: Children) => {
  const storeRef = useRef<AppStore | null>(null);

  if (!storeRef.current) {
    storeRef.current = makeStore();
    setupListeners(storeRef.current.dispatch);
  }

  return <Provider store={storeRef.current}>{children}</Provider>;
};
