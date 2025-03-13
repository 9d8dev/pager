/**
 * usage
 * 
 * 
 * import { page } from "pagerdev";
 * 
 * await page("new subscriber on router", {
 *  slack: "https://slack.com/webhook",
 *  email: "test@test.com",
 * })
 * 
 */

type PagerNotificationOptions = {
  notif?: boolean;
  slack?: string;
  discord?: string;
  email?: string;
  webhook?: string;
};

export async function page(
  message: string,
  options: PagerNotificationOptions = {}
) {
  if (message.length > 256) {
    throw new Error("Message length cannot exceed 256 characters.");
  }

  const defaultOptions = {
    ...options,
    notif: options.notif ?? true,
    discord: options.discord ?? undefined,
    email: options.email ?? undefined,
    slack: options.slack ?? undefined,
    webhook: options.webhook ?? undefined,
  };

  const environmentVariable = process.env.PAGER_DEV_API_KEY;

  if (!environmentVariable) {
    throw new Error(
      "PAGER_DEV_API_KEY is not set. Please set it in your environment variables."
    );
  }

  // TODO: use axios
  await fetch("https://pager.dev/api/v1", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${environmentVariable}`,
    },
    body: JSON.stringify({
      message,
      ...defaultOptions,
    }),
  });
}
