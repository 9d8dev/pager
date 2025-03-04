"use client";

import { createContext, useContext } from "react";

export interface PagerConfig {
  apiKey?: string;
  backendUrl?: string;
  debug?: boolean;
}

export interface PagerContextValue {
  config: PagerConfig;
  page: (
    message: string,
    options?: { priority?: "low" | "medium" | "high" }
  ) => Promise<void>;
}

export const PagerContext = createContext<PagerContextValue | null>(null);

export function usePager() {
  const context = useContext(PagerContext);
  if (!context) {
    throw new Error("usePager must be used within a PagerProvider");
  }
  return context;
}
