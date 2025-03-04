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
      timestamp: new Date().toISOString(),
    };

    // Make the API call
    const response = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(apiKey && { Authorization: `Bearer ${apiKey}` }),
      },
      body: JSON.stringify(payload),
    });

    // Handle errors
    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText);

      if (debug) {
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

    // Success logging if debug is enabled
    if (debug) {
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
}

// Export everything
export * from "./context";
export * from "./provider";
export * from "./types";
