# Pager

A developer-first notification system for TypeScript applications, with first-class support for Next.js.

## Features

- **Lightweight**: Zero UI components, purely functional notification system
- **TypeScript-first**: Full type safety for all APIs
- **Next.js compatible**: Works with both App Router and Pages Router
- **Flexible**: Use with React context or as a standalone function
- **Environment-aware**: Configure via props or environment variables
- **Rate limited**: Built-in protection against notification spam

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
NEXT_PUBLIC_PAGER_API_KEY=your-api-key
NEXT_PUBLIC_PAGER_BACKEND_URL=https://your-backend-url.com/api/notifications
NEXT_PUBLIC_PAGER_DEBUG=false

# Server-side environment variables (only accessible in server code)
# These are used by the standalone page() function in server contexts
PAGER_API_KEY=your-server-api-key
PAGER_BACKEND_URL=https://your-backend-url.com/api/notifications
PAGER_DEBUG=false
```

> **Note**: In Next.js, only environment variables prefixed with `NEXT_PUBLIC_` are accessible in the browser. For server-side code (API routes, server components, server actions), you can use the non-prefixed versions.

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

// In a server action or API route
export async function handleFormSubmission(formData: FormData) {
  'use server';

  // Process form data...

  // Send notification - will use PAGER_* environment variables in server context
  await page('New form submission received!', { priority: 'high' });

  // Or with explicit configuration
  await page('New form submission received!', {
    apiKey: process.env.PAGER_API_KEY,
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
  throttleMs: 10000 // Rate limiting: 10 seconds between notifications (default: 5000ms)
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
  throttleMs: 10000 // Rate limiting: 10 seconds between notifications
});

// With just priority
await page('Message', { priority: 'high' });
```

## Architecture

Pager is designed to be as lightweight as possible:

- **No UI Components**: Unlike toast libraries, Pager doesn't render any UI elements
- **Pure Configuration**: The provider only handles configuration and provides the notification function
- **Minimal Side Effects**: Only performs API calls when explicitly triggered
- **Flexible Usage**: Works both within React components and in server-side code
- **Environment-Aware**: Automatically uses the appropriate environment variables based on context
- **Rate Limited**: Prevents notification spam with configurable throttling

## API Reference

### PagerProvider

```tsx
<PagerProvider config?: {
  apiKey?: string;
  backendUrl?: string;
  debug?: boolean;
  throttleMs?: number; // Default: 5000 (5 seconds)
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
  } | {
    priority?: 'low' | 'medium' | 'high';
    category?: string;
    tags?: string[];
    metadata?: Record<string, any>;
  },
  options?: {
    priority?: 'low' | 'medium' | 'high';
    category?: string;
    tags?: string[];
    metadata?: Record<string, any>;
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
}
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

## License

ISC
