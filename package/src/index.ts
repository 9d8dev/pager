type BaseOptions = {
  notif?: boolean;
  discord?: boolean;
  email?: boolean;
};

type SlackEnabled = {
  slack: true;
  slackWebhook: string;
};

type SlackDisabled = {
  slack?: false;
  slackWebhook?: never;
};

type DiscordEnabled = {
  discord: true;
  discordWebhook: string;
};

type DiscordDisabled = {
  discord?: false;
  discordWebhook?: never;
};

type EmailEnabled = {
  email: true;
  emailAddress: string;
};

type EmailDisabled = {
  email?: false;
  emailAddress?: never;
};

type PagerNotificationOptions = BaseOptions &
  (SlackEnabled | SlackDisabled) &
  (DiscordEnabled | DiscordDisabled) &
  (EmailEnabled | EmailDisabled);

export async function page(
  message: string,
  options: PagerNotificationOptions = {}
) {
  const defaultOptions = {
    ...options,
    notif: options.notif ?? true,
    discord: options.discord ?? true,
    email: options.email ?? true,
    slack: options.slack ?? true,
  };

  // ... rest of the function implementation
}
