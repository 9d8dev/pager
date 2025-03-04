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
      throttleMs: config.throttleMs || 5000, // 5 seconds default throttle
    };
  }, [config.apiKey, config.backendUrl, config.debug, config.throttleMs]);

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

    // Security warning for sensitive API keys
    if (
      resolvedConfig.apiKey &&
      resolvedConfig.apiKey === process.env.NEXT_PUBLIC_PAGER_API_KEY
    ) {
      console.warn(
        "[Pager] Security Warning: Using NEXT_PUBLIC_PAGER_API_KEY in browser context. " +
          "If this is a sensitive API key, consider using server-side functions " +
          "with non-public environment variables instead."
      );
    }
  }, [resolvedConfig]);

  // Create the page function
  const page = useMemo(() => {
    // Rate limiting state (closure-scoped)
    let lastNotificationTime = 0;

    // Batching state (closure-scoped)
    let notificationQueue: Array<{
      payload: PagerNotificationPayload;
      resolve: (response: PagerNotificationResponse) => void;
      timestamp: string;
    }> = [];
    let batchTimeout: NodeJS.Timeout | null = null;

    // Process batched notifications
    const processBatch = async () => {
      // Clear the timeout
      if (batchTimeout) {
        clearTimeout(batchTimeout);
        batchTimeout = null;
      }

      // If queue is empty, do nothing
      if (notificationQueue.length === 0) return;

      if (resolvedConfig.debug) {
        console.log(
          `[Pager] Processing batch of ${notificationQueue.length} notifications`
        );
      }

      // Copy the queue and clear it
      const currentQueue = [...notificationQueue];
      notificationQueue = [];

      // Create a batch payload
      const batchPayload = {
        notifications: currentQueue.map((n) => n.payload),
        timestamp: new Date().toISOString(),
        batchSize: currentQueue.length,
      };

      // Make sure backendUrl is not undefined
      const url = `${resolvedConfig.backendUrl || "/api/notifications"}/batch`;

      try {
        // Make the API call
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(resolvedConfig.apiKey && {
              Authorization: `Bearer ${resolvedConfig.apiKey}`,
            }),
          },
          body: JSON.stringify(batchPayload),
        });

        if (!response.ok) {
          const errorText = await response
            .text()
            .catch(() => response.statusText);

          // Resolve all with error
          currentQueue.forEach((notification) => {
            notification.resolve({
              success: false,
              error: `Failed to send batch notification: ${errorText}`,
              timestamp: notification.timestamp,
            });
          });

          if (resolvedConfig.debug) {
            console.error(`[Pager] Batch request failed: ${errorText}`);
          }
          return;
        }

        // Parse response
        let responseData;
        try {
          responseData = await response.json();
        } catch (e) {
          // If not JSON, create a default response
          responseData = {
            success: true,
            timestamp: new Date().toISOString(),
          };
        }

        // Resolve all notifications with success
        currentQueue.forEach((notification) => {
          notification.resolve({
            ...responseData,
            success: true,
            timestamp: notification.timestamp,
            batched: true,
            batchSize: currentQueue.length,
          });
        });

        if (resolvedConfig.debug) {
          console.log(
            `[Pager] Batch of ${currentQueue.length} notifications sent successfully`
          );
        }
      } catch (error) {
        // Handle errors
        const errorMessage =
          error instanceof Error ? error.message : String(error);

        // Resolve all with error
        currentQueue.forEach((notification) => {
          notification.resolve({
            success: false,
            error: `Failed to send batch notification: ${errorMessage}`,
            timestamp: notification.timestamp,
          });
        });

        if (resolvedConfig.debug) {
          console.error(`[Pager] Error sending batch: ${errorMessage}`);
        }
      }
    };

    // Clean up function to prevent memory leaks
    const clearQueue = () => {
      if (batchTimeout) {
        clearTimeout(batchTimeout);
        batchTimeout = null;
      }

      // Resolve any pending notifications with an error
      notificationQueue.forEach((notification) => {
        notification.resolve({
          success: false,
          error: "Notification queue was cleared before sending",
          timestamp: notification.timestamp,
        });
      });

      // Clear the queue
      notificationQueue = [];
    };

    // Register cleanup on unmount
    useEffect(() => {
      return () => {
        clearQueue();
      };
    }, []);

    return async (
      message: string,
      options: PagerNotificationOptions = {}
    ): Promise<PagerNotificationResponse> => {
      // Create a timestamp for this notification attempt
      const timestamp = new Date().toISOString();

      // Get throttle time with fallback to ensure it's never undefined
      const throttleMs = resolvedConfig.throttleMs || 5000;

      // Get batching configuration
      const batchingEnabled =
        resolvedConfig.batchingEnabled || options.batchingEnabled || false;
      const batchDelayMs = resolvedConfig.batchDelayMs || 2000;

      // Skip rate limiting and batching for high priority notifications
      const isHighPriority = options.priority === "high";

      // Apply rate limiting unless this is a high priority notification
      if (!isHighPriority) {
        // Rate limiting check
        const now = Date.now();
        const timeSinceLastCall = now - lastNotificationTime;

        if (lastNotificationTime > 0 && timeSinceLastCall < throttleMs) {
          const retryAfterMs = throttleMs - timeSinceLastCall;
          const retryAfterSec = Math.ceil(retryAfterMs / 1000);

          if (resolvedConfig.debug) {
            console.warn(
              `[Pager] Rate limited: Too many notifications. Try again in ${retryAfterSec} seconds.`
            );
          }

          return {
            success: false,
            error: `Rate limited: Too many notifications. Try again in ${retryAfterSec} seconds.`,
            timestamp,
            rateLimited: true,
            retryAfter: retryAfterSec,
          };
        }
      }

      // Prepare the payload
      const payload: PagerNotificationPayload = {
        message,
        ...options,
        timestamp,
      };

      // If batching is enabled and this is not a high priority notification
      if (batchingEnabled && !isHighPriority) {
        return new Promise((resolve) => {
          // Create a notification object with its resolver
          const notification = {
            payload,
            resolve,
            timestamp,
          };

          // Add to queue
          notificationQueue.push(notification);

          if (resolvedConfig.debug) {
            console.log(
              `[Pager] Added notification to batch queue. Queue size: ${notificationQueue.length}`
            );
          }

          // If no timeout is active, create one
          if (!batchTimeout) {
            batchTimeout = setTimeout(() => processBatch(), batchDelayMs);
          }
        });
      }

      try {
        if (resolvedConfig.debug) {
          console.log("[Pager] Sending notification:", message, options);
        }

        // Make sure backendUrl is not undefined
        const url = resolvedConfig.backendUrl || "/api/notifications";

        // Make the API call with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        try {
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
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          // Update the last notification time for rate limiting
          lastNotificationTime = Date.now();

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
              timestamp,
            };

            // Log the error but don't throw, just return the error response
            console.warn("[Pager] Notification failed:", errorResponse.error);
            return errorResponse;
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
              timestamp,
            };
          }

          if (resolvedConfig.debug) {
            console.log(
              "[Pager] Notification sent successfully:",
              responseData
            );
          }

          return responseData;
        } catch (fetchError) {
          clearTimeout(timeoutId);
          throw fetchError; // Re-throw to be caught by the outer try/catch
        }
      } catch (error) {
        // Determine if this is a timeout error
        const isTimeout = error instanceof Error && error.name === "AbortError";
        const errorMessage = isTimeout
          ? "Notification request timed out after 10 seconds"
          : error instanceof Error
            ? error.message
            : String(error);

        // Log the error
        console.warn("[Pager] Error sending notification:", errorMessage);

        if (resolvedConfig.debug) {
          console.error("[Pager] Error details:", error);
        }

        // Create a structured error response
        const errorResponse: PagerNotificationResponse = {
          success: false,
          error: errorMessage,
          timestamp,
        };

        // Return the error response instead of throwing
        // This prevents the app from crashing due to notification failures
        return errorResponse;
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
