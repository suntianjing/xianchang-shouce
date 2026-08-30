/** Standalone no-op: Grok preview postMessage bridge is not needed after clone. */
export function collectRoutePathsFromTree(_tree: unknown): string[] {
  return [];
}

export function installPreviewHostBridge(_opts: {
  navigate: (path: string) => void;
  getRoutePaths: () => string[];
}): () => void {
  return () => {};
}
