"use client";

import { ReactNode, useMemo, useEffect } from "react";
import { PagerContext } from "./context";
import {
  PagerConfig,
  PagerNotificationOptions,
  PagerNotificationResponse,
  PagerNotificationPayload,
} from "./types";

/**
 * Props for the PagerProvider component
 */
interface PagerProviderProps {
  /**
   * Child components that will have access to the Pager context
   */
  children: ReactNode;

  /**
   * Configuration options for the Pager system
   */
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
  const resolvedConfig = useMemo<PagerConfig>(() => {
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
    return async (
      message: string,
      options: PagerNotificationOptions = {}
    ): Promise<PagerNotificationResponse> => {
      try {
        if (resolvedConfig.debug) {
          console.log("[Pager] Sending notification:", message, options);
        }

        // Prepare the payload
        const payload: PagerNotificationPayload = {
          message,
          ...options,
          timestamp: new Date().toISOString(),
        };

        // Make sure backendUrl is not undefined
        const url = resolvedConfig.backendUrl || "/api/notifications";

        // Make the API call
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(resolvedConfig.apiKey && {
              Authorization: `Bearer ${resolvedConfig.apiKey}`,
            }),
          },
          body: JSON.stringify(payload),
        });

        // Handle errors
        if (!response.ok) {
          const errorText = await response
            .text()
            .catch(() => response.statusText);

          if (resolvedConfig.debug) {
            console.error("[Pager] Error response:", errorText);
          }

          const errorResponse: PagerNotificationResponse = {
            success: false,
            error: `Failed to send notification: ${errorText}`,
            timestamp: new Date().toISOString(),
          };

          throw Object.assign(
            new Error(`Failed to send notification: ${errorText}`),
            { response: errorResponse }
          );
        }

        // Parse the response
        let responseData: PagerNotificationResponse;

        try {
          // Try to parse the response as JSON
          responseData = await response.json();
        } catch (e) {
          // If the response is not JSON, create a default success response
          responseData = {
            success: true,
            timestamp: new Date().toISOString(),
          };
        }

        if (resolvedConfig.debug) {
          console.log("[Pager] Notification sent successfully:", responseData);
        }

        return responseData;
      } catch (error) {
        console.error("[Pager] Error sending notification:", error);

        // If the error already has a response object (from our throw above), use it
        if (error instanceof Error && "response" in error) {
          return (error as any).response;
        }

        // Otherwise, create a generic error response
        const errorResponse: PagerNotificationResponse = {
          success: false,
          error: error instanceof Error ? error.message : String(error),
          timestamp: new Date().toISOString(),
        };

        throw Object.assign(
          error instanceof Error ? error : new Error(String(error)),
          { response: errorResponse }
        );
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
