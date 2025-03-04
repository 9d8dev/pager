/**
 * Priority levels for notifications
 */
export type PagerPriority = "low" | "medium" | "high";

/**
 * Configuration options for the Pager system
 */
export interface PagerConfig {
  /**
   * API key for authentication with the notification service
   */
  apiKey?: string;

  /**
   * URL of the backend notification service
   * @default "/api/notifications"
   */
  backendUrl?: string;

  /**
   * Enable debug mode for verbose logging
   * @default false
   */
  debug?: boolean;

  /**
   * Throttle time in milliseconds between notifications
   * Used for rate limiting to prevent spamming the backend
   * High priority notifications bypass this limit
   * @default 5000 (5 seconds)
   */
  throttleMs?: number;

  /**
   * Enable batching of notifications
   * When enabled, multiple notifications sent in quick succession
   * will be grouped into a single request to reduce network overhead
   * High priority notifications are always sent immediately
   * @default false
   */
  batchingEnabled?: boolean;

  /**
   * Delay in milliseconds to wait for collecting notifications before sending a batch
   * Only applies when batching is enabled
   * @default 2000 (2 seconds)
   */
  batchDelayMs?: number;
}

/**
 * Options for sending a notification
 */
export interface PagerNotificationOptions {
  /**
   * Priority level of the notification
   * @default "medium"
   */
  priority?: PagerPriority;

  /**
   * Optional category for grouping notifications
   */
  category?: string;

  /**
   * Optional tags for filtering notifications
   */
  tags?: string[];

  /**
   * Optional metadata to include with the notification
   */
  metadata?: Record<string, any>;

  /**
   * Enable batching for this notification
   * When enabled, this notification may be grouped with others
   * High priority notifications are always sent immediately regardless of this setting
   * @default false
   */
  batchingEnabled?: boolean;
}

/**
 * Payload sent to the notification backend
 */
export interface PagerNotificationPayload {
  /**
   * The notification message
   */
  message: string;

  /**
   * Priority level
   */
  priority?: PagerPriority;

  /**
   * Category for grouping
   */
  category?: string;

  /**
   * Tags for filtering
   */
  tags?: string[];

  /**
   * Additional metadata
   */
  metadata?: Record<string, any>;

  /**
   * Timestamp when the notification was sent
   */
  timestamp: string;
}

/**
 * Response from the notification backend
 */
export interface PagerNotificationResponse {
  /**
   * Whether the notification was successfully sent
   */
  success: boolean;

  /**
   * ID of the notification (if successful)
   */
  id?: string;

  /**
   * Error message (if unsuccessful)
   */
  error?: string;

  /**
   * Timestamp when the notification was processed
   */
  timestamp?: string;

  /**
   * Whether the notification was rate limited
   */
  rateLimited?: boolean;

  /**
   * Number of seconds to wait before retrying (if rate limited)
   */
  retryAfter?: number;

  /**
   * Whether this notification was sent as part of a batch
   */
  batched?: boolean;

  /**
   * Number of notifications in the batch (if batched)
   */
  batchSize?: number;
}

/**
 * Internal type for batched notifications
 * @internal
 */
export interface PagerBatchedNotification {
  /**
   * The notification payload
   */
  payload: PagerNotificationPayload;

  /**
   * API key for authentication
   */
  apiKey: string;

  /**
   * Backend URL to send the notification to
   */
  backendUrl: string;

  /**
   * Function to resolve the promise when the notification is sent
   */
  resolve: (response: PagerNotificationResponse) => void;

  /**
   * Timestamp when the notification was created
   */
  timestamp: string;
}
