"use client";

import { ReactNode, useMemo, useEffect } from "react";
import { PagerContext, PagerConfig } from "./context";

interface PagerProviderProps {
  children: ReactNode;
  config?: Partial<PagerConfig>;
}

/**
 * PagerProvider component for configuring the notification system
 *
 * This provider should be placed high in your component tree, typically in
 * your app layout or _app.tsx file. It doesn't render any UI elements,
 * it only provides configuration and the notification function to your app.
 *
 * @example
 * // In Next.js App Router
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <PagerProvider>
 *           {children}
 *         </PagerProvider>
 *       </body>
 *     </html>
 *   );
 * }
 */
export function PagerProvider({ children, config = {} }: PagerProviderProps) {
  // Combine props with environment variables, with props taking precedence
  const resolvedConfig = useMemo(() => {
    return {
      apiKey: config.apiKey || process.env.NEXT_PUBLIC_PAGER_API_KEY || "",
      backendUrl:
        config.backendUrl ||
        process.env.NEXT_PUBLIC_PAGER_BACKEND_URL ||
        "/api/notifications",
      debug:
        config.debug || process.env.NEXT_PUBLIC_PAGER_DEBUG === "true" || false,
    };
  }, [config.apiKey, config.backendUrl, config.debug]);

  // Validate configuration on mount - only runs once and only in debug mode
  useEffect(() => {
    if (resolvedConfig.debug) {
      console.log("[Pager] Initialized with config:", {
        backendUrl: resolvedConfig.backendUrl,
        apiKey: resolvedConfig.apiKey ? "********" : "(not set)",
        debug: resolvedConfig.debug,
      });

      // Warn if no API key is provided
      if (!resolvedConfig.apiKey) {
        console.warn("[Pager] No API key provided. Authentication may fail.");
      }

      // Warn if using default backend URL
      if (resolvedConfig.backendUrl === "/api/notifications") {
        console.warn(
          "[Pager] Using default backend URL. Make sure to set NEXT_PUBLIC_PAGER_BACKEND_URL in your .env file or pass it as a prop."
        );
      }
    }
  }, [resolvedConfig]);

  // Create the page function
  const page = useMemo(() => {
    return async (message: string, options = {}) => {
      try {
        if (resolvedConfig.debug) {
          console.log("[Pager] Sending notification:", message, options);
        }

        const response = await fetch(resolvedConfig.backendUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(resolvedConfig.apiKey && {
              Authorization: `Bearer ${resolvedConfig.apiKey}`,
            }),
          },
          body: JSON.stringify({
            message,
            ...options,
            timestamp: new Date().toISOString(),
          }),
        });

        if (!response.ok) {
          const errorText = await response
            .text()
            .catch(() => response.statusText);
          throw new Error(`Failed to send notification: ${errorText}`);
        }

        if (resolvedConfig.debug) {
          console.log("[Pager] Notification sent successfully");
        }

        return;
      } catch (error) {
        console.error("[Pager] Error sending notification:", error);
        throw error;
      }
    };
  }, [resolvedConfig]);

  // Create the context value
  const value = useMemo(
    () => ({
      config: resolvedConfig,
      page,
    }),
    [resolvedConfig, page]
  );

  // Render only the context provider with no additional UI elements
  return (
    <PagerContext.Provider value={value}>{children}</PagerContext.Provider>
  );
}
