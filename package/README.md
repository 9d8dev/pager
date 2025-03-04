# Pager

A developer-first notification system for TypeScript applications, with first-class support for Next.js.

## Features

- **Lightweight**: Zero UI components, purely functional notification system
- **TypeScript-first**: Full type safety for all APIs
- **Next.js compatible**: Works with both App Router and Pages Router
- **Flexible**: Use with React context or as a standalone function
- **Environment-aware**: Configure via props or environment variables
- **Rate limited**: Built-in protection against notification spam
- **Security-focused**: Best practices for API key handling
- **Performance optimized**: Request batching for high-volume notifications

## Installation

```bash
npm install pager
# or
yarn add pager
# or
pnpm add pager
```

## Usage

### 1. Set up environment variables

Create a `.env.local` file in your Next.js project root:

```env
# Client-side environment variables (accessible in the browser)
# IMPORTANT: Only use NEXT_PUBLIC_ variables for non-sensitive configuration
# DO NOT put sensitive API keys in NEXT_PUBLIC_ variables
NEXT_PUBLIC_PAGER_BACKEND_URL=https://your-backend-url.com/api/notifications
NEXT_PUBLIC_PAGER_DEBUG=false

# Server-side environment variables (only accessible in server code)
# Use these for sensitive API keys and credentials
PAGER_API_KEY=your-server-api-key
PAGER_BACKEND_URL=https://your-backend-url.com/api/notifications
PAGER_DEBUG=false
```

> **Security Note**: Environment variables prefixed with `NEXT_PUBLIC_` are exposed to the browser. Never put sensitive API keys or credentials in these variables. For secure authentication, use the non-prefixed versions in server-side code only.

### 2. Add the Provider to your application

The `PagerProvider` is a lightweight context provider with no UI rendering. It simply provides configuration and the notification function to your application.

#### Next.js App Router (Next.js 13+)

In your root layout:

```tsx
// app/layout.tsx
import { PagerProvider } from 'pager';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <PagerProvider>
          {children}
        </PagerProvider>
      </body>
    </html>
  );
}
```

#### Next.js Pages Router (Next.js 12 and earlier)

In your `_app.tsx`:

```tsx
// pages/_app.tsx
import type { AppProps } from 'next/app';
import { PagerProvider } from 'pager';

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <PagerProvider>
      <Component {...pageProps} />
    </PagerProvider>
  );
}
```

### 3. Use the hook in your components

```tsx
'use client'; // If using App Router in a client component

import { usePager } from 'pager';

export default function MyComponent() {
  const { page } = usePager();

  const handleClick = async () => {
    await page('User clicked the button!', { priority: 'high' });
  };

  return (
    <button onClick={handleClick}>
      Send Notification
    </button>
  );
}
```

### 4. Or use the standalone function

You can also use the `page` function directly without the React context:

```tsx
import { page } from 'pager';

// In a server action or API route (RECOMMENDED for secure usage)
export async function handleFormSubmission(formData: FormData) {
  'use server';

  // Process form data...

  // Send notification - will use PAGER_* environment variables in server context
  // This is the SECURE way to use API keys
  await page('New form submission received!', {
    priority: 'high',
    // The apiKey is securely accessed from server environment variables
    apiKey: process.env.PAGER_API_KEY, // NOT prefixed with NEXT_PUBLIC_
    backendUrl: process.env.PAGER_BACKEND_URL
  });

  // ...
}
```

## Configuration Options

You can configure Pager in three ways:

### 1. Environment Variables

```env
# Client-side
NEXT_PUBLIC_PAGER_API_KEY=your-api-key
NEXT_PUBLIC_PAGER_BACKEND_URL=https://your-backend-url.com/api
NEXT_PUBLIC_PAGER_DEBUG=false

# Server-side
PAGER_API_KEY=your-server-api-key
PAGER_BACKEND_URL=https://your-backend-url.com/api
PAGER_DEBUG=false
```

### 2. Provider Props

```tsx
<PagerProvider config={{
  apiKey: 'your-api-key', // Overrides NEXT_PUBLIC_PAGER_API_KEY
  backendUrl: 'https://custom-endpoint.com/api', // Overrides NEXT_PUBLIC_PAGER_BACKEND_URL
  debug: true, // Overrides NEXT_PUBLIC_PAGER_DEBUG
  throttleMs: 10000, // Rate limiting: 10 seconds between notifications (default: 5000ms)
  batchingEnabled: true, // Enable batching for high-volume notifications
  batchDelayMs: 2000 // Wait 2 seconds to collect notifications before sending (default: 2000ms)
}}>
  {children}
</PagerProvider>
```

### 3. Function Parameters

```tsx
// Standalone function with explicit config
await page('Message', {
  apiKey: 'your-api-key',
  backendUrl: 'https://custom-endpoint.com/api',
  debug: true,
  throttleMs: 10000, // Rate limiting: 10 seconds between notifications
  batchingEnabled: true, // Enable batching for high-volume notifications
  batchDelayMs: 1000 // Wait 1 second to collect notifications before sending
});

// With just priority
await page('Message', { priority: 'high' });

// With batching enabled for a specific notification
await page('Message', { batchingEnabled: true });
```

## Architecture

Pager is designed to be as lightweight as possible:

- **No UI Components**: Unlike toast libraries, Pager doesn't render any UI elements
- **Pure Configuration**: The provider only handles configuration and provides the notification function
- **Minimal Side Effects**: Only performs API calls when explicitly triggered
- **Flexible Usage**: Works both within React components and in server-side code
- **Environment-Aware**: Automatically uses the appropriate environment variables based on context
- **Rate Limited**: Prevents notification spam with configurable throttling
- **Memory Efficient**: Automatic cleanup of resources to prevent memory leaks
- **Network Optimized**: Batching for high-volume notifications to reduce HTTP requests

## API Reference

### PagerProvider

```tsx
<PagerProvider config?: {
  apiKey?: string;
  backendUrl?: string;
  debug?: boolean;
  throttleMs?: number; // Default: 5000 (5 seconds)
  batchingEnabled?: boolean; // Default: false
  batchDelayMs?: number; // Default: 2000 (2 seconds)
}>
```

### usePager

```tsx
const { page, config } = usePager();

// page function
page(message: string, options?: {
  priority?: 'low' | 'medium' | 'high';
  category?: string;
  tags?: string[];
  metadata?: Record<string, any>;
  batchingEnabled?: boolean; // Enable batching for this notification
}): Promise<PagerNotificationResponse>
```

### Standalone page function

```tsx
// Function signature
page(
  message: string,
  configOrOptions?: {
    apiKey?: string;
    backendUrl?: string;
    debug?: boolean;
    throttleMs?: number; // Default: 5000 (5 seconds)
    batchingEnabled?: boolean; // Default: false
    batchDelayMs?: number; // Default: 2000 (2 seconds)
  } | {
    priority?: 'low' | 'medium' | 'high';
    category?: string;
    tags?: string[];
    metadata?: Record<string, any>;
    batchingEnabled?: boolean; // Enable batching for this notification
  },
  options?: {
    priority?: 'low' | 'medium' | 'high';
    category?: string;
    tags?: string[];
    metadata?: Record<string, any>;
    batchingEnabled?: boolean; // Enable batching for this notification
  }
): Promise<PagerNotificationResponse>

// Examples
await page('Simple message');
await page('With priority', { priority: 'high' });
await page('With config', { apiKey: 'custom-key', backendUrl: 'custom-url' });
await page('With both', { apiKey: 'custom-key' }, { priority: 'high' });
```

### Response Object

The `page` function returns a promise that resolves to a response object:

```tsx
interface PagerNotificationResponse {
  success: boolean;
  id?: string;           // Present on successful notifications
  error?: string;        // Present on failed notifications
  timestamp?: string;    // ISO timestamp
  rateLimited?: boolean; // True if the notification was rate limited
  retryAfter?: number;   // Seconds to wait before retrying (if rate limited)
  batched?: boolean;     // True if the notification was sent as part of a batch
  batchSize?: number;    // Number of notifications in the batch (if batched)
}
```

### Cleanup Function

```tsx
import { clearNotificationQueue } from 'pager';

// Call this function to clear any pending batched notifications
// Useful when cleaning up resources or when the app is about to unload
clearNotificationQueue();
```

### Rate Limiting

Pager includes built-in rate limiting to prevent accidental notification spam:

- By default, notifications are limited to one every 5 seconds
- High priority notifications (`priority: 'high'`) bypass rate limiting
- Rate limiting can be configured via the `throttleMs` option
- When rate limited, the function returns a response with `success: false` and `rateLimited: true`

Example handling rate limiting:

```tsx
const response = await page('Test notification');

if (response.success) {
  console.log('Notification sent successfully!');
} else if (response.rateLimited) {
  console.warn(`Rate limited. Try again in ${response.retryAfter} seconds.`);
} else {
  console.error('Failed to send notification:', response.error);
}
```

### Batching

For high-volume notification scenarios, Pager supports batching multiple notifications into a single HTTP request:

- Enable batching globally via the `batchingEnabled` configuration option
- Enable batching for specific notifications via the `batchingEnabled` option in notification options
- Configure the batch delay via the `batchDelayMs` option (default: 2000ms)
- High priority notifications (`priority: 'high'`) are always sent immediately, bypassing batching
- Batched notifications include `batched: true` and `batchSize` in the response

Example using batching:

```tsx
// Enable batching for all notifications
<PagerProvider config={{ batchingEnabled: true }}>
  {children}
</PagerProvider>

// Or enable batching for specific notifications
await page('First notification', { batchingEnabled: true });
await page('Second notification', { batchingEnabled: true });
// These will be sent together in a single request if they occur within the batch delay

// Check if a notification was batched
const response = await page('Test notification', { batchingEnabled: true });
if (response.batched) {
  console.log(`Sent in a batch with ${response.batchSize} other notifications`);
}
```

## Performance Considerations

Pager is designed to be lightweight and performant:

1. **Minimal Dependencies**: Zero external runtime dependencies
2. **Asynchronous Processing**: All operations are non-blocking
3. **Memory Management**: Automatic cleanup of resources to prevent memory leaks
4. **Request Batching**: Reduces HTTP overhead for high-volume notifications
5. **Efficient Error Handling**: Returns structured responses instead of throwing exceptions
6. **Timeout Protection**: Prevents hanging requests with automatic timeouts
7. **Tree-Shakable**: Only import what you need

For high-volume notification scenarios:

- Enable batching to reduce the number of HTTP requests
- Use server-side processing for bulk notifications
- Consider using a queue or background processing for very high volumes

## Security Best Practices

### API Key Security

Pager follows a security-first approach for handling authentication:

1. **Never expose sensitive API keys in client-side code**:
   - Do not use `NEXT_PUBLIC_PAGER_API_KEY` for sensitive API keys
   - For sensitive keys, use `PAGER_API_KEY` (without the NEXT_PUBLIC_ prefix) in server-side code only

2. **Recommended authentication patterns**:
   - **Server Components/Actions**: Use the `page` function in Next.js server components, API routes, or server actions
   - **API Route Proxy**: Create a simple API route in your app that proxies requests to the notification service
   - **Public/Private Key Pairs**: If your notification service supports it, use a publishable key for client-side and keep the secret key on the server

3. **Client-side options**:
   - Use cookie-based authentication that doesn't expose credentials in JavaScript
   - Use a backend proxy API route that adds the authentication headers
   - Use a publishable API key that has limited permissions (if your service supports this)

### Example: Secure Server-Side Usage

```tsx
// app/api/notify/route.ts (Next.js App Router)
import { page } from 'pager';

export async function POST(request: Request) {
  const body = await request.json();

  // Validate the request, check user permissions, etc.

  // Use the secure server-side environment variables
  const response = await page(body.message, {
    priority: body.priority,
    apiKey: process.env.PAGER_API_KEY,
    backendUrl: process.env.PAGER_BACKEND_URL
  });

  return Response.json(response);
}
```

### Example: Client-Side with Backend Proxy

```tsx
// Client component
'use client';

import { useState } from 'react';

export default function NotifyButton() {
  const [sending, setSending] = useState(false);

  const handleClick = async () => {
    setSending(true);

    try {
      // Call your secure API route instead of using the API key directly
      const response = await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Button clicked!',
          priority: 'medium'
        })
      });

      const result = await response.json();
      console.log('Notification sent:', result);
    } catch (error) {
      console.error('Failed to send notification:', error);
    } finally {
      setSending(false);
    }
  };

  return (
    <button onClick={handleClick} disabled={sending}>
      {sending ? 'Sending...' : 'Send Notification'}
    </button>
  );
}
```

## License

ISC
