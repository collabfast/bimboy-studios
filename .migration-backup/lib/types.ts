export type NavItem = {
  href: string;
  label: string;
};

export type CreatorSummary = {
  slug: string;
  name: string;
  tagline: string;
  specialty: string;
  royaltyRate: number;
  monthlyAudience: string;
  verified: boolean;
};

export type VideoSummary = {
  slug: string;
  title: string;
  studio: string;
  status: string;
  summary: string;
};

export type CreatorVideoStatus =
  | "Draft"
  | "Processing"
  | "Published"
  | "Locked";

export type CreatorVideoRecord = {
  id: string;
  slug: string;
  title: string;
  description: string;
  creatorSlug: string;
  creatorName: string;
  tags: string[];
  price: number;
  previewLengthSeconds: number;
  durationMinutes: number;
  status: CreatorVideoStatus;
  access: "Premium" | "Free";
  uploadProgress: number;
  updatedAt: string;
  cast: string[];
  streamAssetStatus:
    | "awaiting_upload"
    | "queued"
    | "processing"
    | "ready"
    | "error";
  streamUid?: string;
};

export type CloudflareStreamUploadIntent = {
  uploadUrl: string;
  uid?: string;
  maxDurationSeconds?: number;
};

export type CloudflareStreamUploadConfig = {
  uploadMode: "direct-creator-upload";
  supportsTus: boolean;
  requiresSignedPlayback: boolean;
  moderationPipelineEnabled: boolean;
};

export type StudioSummary = {
  slug: string;
  name: string;
  focus: string;
  status: string;
};

export type DashboardNavItem = {
  href: string;
  label: string;
  description: string;
};

export type StatItem = {
  label: string;
  value: string;
  description: string;
};
