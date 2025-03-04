export interface PagerConfig {
  apiKey?: string;
  backendUrl?: string;
}

export function page(message: string, config?: PagerConfig): Promise<void> {
  // TODO: Implement actual notification logic
  console.log("Pager notification:", message);
  return Promise.resolve();
}

export function createPagerProvider(config: PagerConfig) {
  // TODO: Implement React provider
  return {
    page: (message: string) => page(message, config),
  };
}
