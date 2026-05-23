import type {
  CloudflareStreamUploadConfig,
  CloudflareStreamUploadIntent,
} from "@/lib/types";
import { cloudflareStreamConfig } from "@/lib/placeholders";

export function getCloudflareStreamUploadConfig(): CloudflareStreamUploadConfig {
  return cloudflareStreamConfig;
}

export async function createCreatorUploadIntent(): Promise<CloudflareStreamUploadIntent> {
  // Baseline integration point for future server-side upload intent creation.
  // Replace this with a signed direct-upload request to Cloudflare Stream.
  return {
    uploadUrl: "",
    maxDurationSeconds: 60 * 60,
  };
}

export function canUseCloudflareDirectUpload() {
  return Boolean(process.env.CLOUDFLARE_STREAM_ACCOUNT_ID);
}
