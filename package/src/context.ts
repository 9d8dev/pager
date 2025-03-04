"use client";

import { createContext, useContext } from "react";
import {
  PagerConfig,
  PagerNotificationOptions,
  PagerNotificationResponse,
} from "./types";

/**
 * Value provided by the PagerContext
 */
export interface PagerContextValue {
  /**
   * Current configuration of the Pager system
   */
  config: PagerConfig;

  /**
   * Function to send a notification
   *
   * @param message - The notification message to send
   * @param options - Additional options for the notification
   * @returns A promise that resolves with the notification response
   */
  page: (
    message: string,
    options?: PagerNotificationOptions
  ) => Promise<PagerNotificationResponse>;
}

/**
 * React context for the Pager notification system
 */
export const PagerContext = createContext<PagerContextValue | null>(null);

/**
 * Hook to access the Pager notification system
 *
 * @returns The Pager context value
 * @throws Error if used outside of a PagerProvider
 *
 * @example
 * const { page } = usePager();
 * await page('Hello world!', { priority: 'high' });
 */
export function usePager(): PagerContextValue {
  const context = useContext(PagerContext);
  if (!context) {
    throw new Error("usePager must be used within a PagerProvider");
  }
  return context;
}
