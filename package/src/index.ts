import { PagerConfig } from "./context";

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
 * @param config - Optional configuration to override environment variables
 * @param options - Additional options for the notification
 * @returns A promise that resolves when the notification is sent
 *
 * @example
 * // Basic usage
 * await page('User signed up!');
 *
 * // With priority
 * await page('Critical error occurred!', { priority: 'high' });
 *
 * // With custom configuration
 * await page('Database backup completed', {
 *   apiKey: 'custom-api-key',
 *   backendUrl: 'https://custom-endpoint.com/api'
 * });
 */
export async function page(
  message: string,
  configOrOptions?:
    | Partial<PagerConfig>
    | { priority?: "low" | "medium" | "high" },
  options?: { priority?: "low" | "medium" | "high" }
): Promise<void> {
  // Handle overloaded function signature
  let config: Partial<PagerConfig> = {};
  let notificationOptions = options || {};

  // Check if first optional parameter is config or options
  if (configOrOptions) {
    if (
      "priority" in configOrOptions &&
      Object.keys(configOrOptions).length === 1
    ) {
      // It's options
      notificationOptions = configOrOptions as {
        priority?: "low" | "medium" | "high";
      };
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

    // Make the API call
    const response = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(apiKey && { Authorization: `Bearer ${apiKey}` }),
      },
      body: JSON.stringify({
        message,
        ...notificationOptions,
        timestamp: new Date().toISOString(),
      }),
    });

    // Handle errors
    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText);
      throw new Error(`Failed to send notification: ${errorText}`);
    }

    // Success logging if debug is enabled
    if (debug) {
      console.log("[Pager] Notification sent successfully");
    }
  } catch (error) {
    console.error("[Pager] Error sending notification:", error);
    throw error;
  }
}

// Export everything from context and provider
export * from "./context";
export * from "./provider";

// Example usage:
/*
// In your Next.js app:
import { PagerProvider, usePager, page } from 'pager';

// 1. Wrap your app with the provider (in app layout or _app.js)
function App() {
  return (
    <PagerProvider config={{
      // Optional: Override environment variables
      apiKey: 'your-api-key',
      backendUrl: 'your-backend-url',
      debug: true
    }}>
      <YourApp />
    </PagerProvider>
  );
}

// 2. Use the hook in your components
function YourComponent() {
  const { page } = usePager();

  const handleClick = async () => {
    await page('Something happened!', { priority: 'high' });
  };

  return <button onClick={handleClick}>Send Notification</button>;
}

// 3. Or use the standalone function anywhere
// This will use environment variables if config is not provided
await page('Something happened outside of React!', { apiKey: 'optional-override' });
*/
