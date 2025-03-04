import {
  PagerConfig,
  PagerNotificationOptions,
  PagerNotificationResponse,
  PagerNotificationPayload,
} from "./types";

// Try to load dotenv in Node.js environments
try {
  // This will only execute in Node.js environments
  // In browser environments, this import will be ignored
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const dotenv = require("dotenv");
  dotenv.config();
} catch (e) {
  // Running in browser, dotenv not needed
}

// Rate limiting state (module-level)
let lastNotificationTime = 0;
const DEFAULT_THROTTLE_MS = 5000; // 5 seconds between notifications by default

/**
 * Send a notification message to the configured backend service
 *
 * This is the main utility function that developers will use to send notifications.
 * It can be used anywhere in the application after the PagerProvider is set up,
 * or standalone with explicit configuration.
 *
 * @param message - The notification message to send
 * @param configOrOptions - Optional configuration or notification options
 * @param options - Additional options for the notification (if first param is config)
 * @returns A promise that resolves with the notification response
 *
 * @example
 * // Basic usage
 * const response = await page('User signed up!');
 * console.log(response.success); // true
 *
 * // With priority
 * const response = await page('Critical error occurred!', { priority: 'high' });
 *
 * // With custom configuration
 * const response = await page('Database backup completed', {
 *   apiKey: 'custom-api-key',
 *   backendUrl: 'https://custom-endpoint.com/api'
 * });
 *
 * // With both config and options
 * const response = await page('Message', { apiKey: 'key' }, { priority: 'high' });
 *
 * // Error handling
 * try {
 *   const response = await page('Important notification');
 *   if (response.success) {
 *     console.log('Notification sent successfully');
 *   } else {
 *     console.warn('Failed to send notification:', response.error);
 *   }
 * } catch (error) {
 *   // This will only happen for network failures or other critical errors
 *   console.error('Critical error sending notification:', error);
 * }
 *
 * // Rate limiting
 * // The page function is throttled by default (one notification per 5 seconds)
 * // Rapid calls will return a rate-limited response rather than sending multiple notifications
 * const response1 = await page('First notification');  // Sent immediately
 * const response2 = await page('Second notification'); // Rate limited if within 5 seconds
 * console.log(response2.success); // false if rate limited
 * console.log(response2.error);   // Contains rate limiting information
 */
export async function page(
  message: string,
  configOrOptions?: Partial<PagerConfig> | PagerNotificationOptions,
  options?: PagerNotificationOptions
): Promise<PagerNotificationResponse> {
  // Handle overloaded function signature
  let config: Partial<PagerConfig> = {};
  let notificationOptions: PagerNotificationOptions = options || {};

  // Check if first optional parameter is config or options
  if (configOrOptions) {
    if (
      "priority" in configOrOptions ||
      "category" in configOrOptions ||
      "tags" in configOrOptions ||
      "metadata" in configOrOptions
    ) {
      // It's options
      notificationOptions = configOrOptions as PagerNotificationOptions;
    } else {
      // It's config
      config = configOrOptions as Partial<PagerConfig>;
    }
  }

  // Resolve configuration with fallbacks
  // For client-side: NEXT_PUBLIC_* variables
  // For server-side: non-prefixed variables
  const apiKey =
    config?.apiKey ||
    process.env.NEXT_PUBLIC_PAGER_API_KEY ||
    process.env.PAGER_API_KEY ||
    "";

  const backendUrl =
    config?.backendUrl ||
    process.env.NEXT_PUBLIC_PAGER_BACKEND_URL ||
    process.env.PAGER_BACKEND_URL ||
    "/api/notifications";

  const debug =
    config?.debug ||
    process.env.NEXT_PUBLIC_PAGER_DEBUG === "true" ||
    process.env.PAGER_DEBUG === "true" ||
    false;

  // Get throttle time from config or use default
  const throttleMs = config?.throttleMs || DEFAULT_THROTTLE_MS;

  // Create a timestamp for this notification attempt
  const timestamp = new Date().toISOString();

  // Rate limiting check
  const now = Date.now();
  const timeSinceLastCall = now - lastNotificationTime;

  // Skip rate limiting for high priority notifications
  const isHighPriority = notificationOptions.priority === "high";

  // Apply rate limiting unless this is a high priority notification
  if (
    !isHighPriority &&
    lastNotificationTime > 0 &&
    timeSinceLastCall < throttleMs
  ) {
    const retryAfterMs = throttleMs - timeSinceLastCall;
    const retryAfterSec = Math.ceil(retryAfterMs / 1000);

    if (debug) {
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

  try {
    // Debug logging if enabled
    if (debug) {
      console.log(
        "[Pager] Sending notification:",
        message,
        notificationOptions
      );
      console.log("[Pager] Using backend URL:", backendUrl);
    }

    // Prepare the payload
    const payload: PagerNotificationPayload = {
      message,
      ...notificationOptions,
      timestamp,
    };

    // Make the API call with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    try {
      const response = await fetch(backendUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(apiKey && { Authorization: `Bearer ${apiKey}` }),
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

        if (debug) {
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

      // Success logging if debug is enabled
      if (debug) {
        console.log("[Pager] Notification sent successfully:", responseData);
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

    if (debug) {
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
}

// Export everything
export * from "./context";
export * from "./provider";
export * from "./types";
