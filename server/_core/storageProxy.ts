import type { Express } from "express";

// Storage proxy is not needed when using S3/R2 directly.
// Images are served from their public S3/R2 URLs.
export function registerStorageProxy(app: Express) {
  // no-op
}
