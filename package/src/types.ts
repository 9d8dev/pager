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
}
