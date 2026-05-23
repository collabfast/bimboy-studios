import type {
  CloudflareStreamUploadConfig,
  CreatorSummary,
  CreatorVideoRecord,
  DashboardNavItem,
  NavItem,
  StatItem,
  StudioSummary,
  VideoSummary,
} from "@/lib/types";

export const siteNavigation: NavItem[] = [
  { href: "/", label: "Home" },
  { href: "/browse", label: "Browse" },
  { href: "/creators", label: "Creators" },
];

export const stats: StatItem[] = [
  {
    label: "Creator profiles",
    value: "24",
    description: "Placeholder count for profile pages, discovery rows, and creator tooling.",
  },
  {
    label: "Studio releases",
    value: "12",
    description: "Starter volume for featured drops, landing pages, and promo cards.",
  },
  {
    label: "Royalty surface",
    value: "3 dashboards",
    description: "Creator, studio, and admin routes are now scaffolded and navigable.",
  },
];

export const creators: CreatorSummary[] = [
  {
    slug: "luna-vale",
    name: "Luna Vale",
    tagline: "Atmospheric performances, premium editorial energy.",
    specialty: "Creator page baseline with credits, featured content, and royalty hooks.",
    royaltyRate: 18,
    monthlyAudience: "$2,450 projected",
    verified: true,
  },
  {
    slug: "nico-voss",
    name: "Nico Voss",
    tagline: "Studio-forward collaborations built for repeat releases.",
    specialty: "Supports future collab rows, performer tags, and studio relationships.",
    royaltyRate: 15,
    monthlyAudience: "$1,980 projected",
    verified: true,
  },
  {
    slug: "rhea-onyx",
    name: "Rhea Onyx",
    tagline: "Premium creator identity with room for future subscription modules.",
    specialty: "Good placeholder for expanding performer bios and content libraries.",
    royaltyRate: 20,
    monthlyAudience: "$3,120 projected",
    verified: false,
  },
];

export const studios: StudioSummary[] = [
  {
    slug: "midnight-room",
    name: "Midnight Room",
    focus: "Cinematic releases, premium promos, and editorial landing pages.",
    status: "Featured studio shell",
  },
  {
    slug: "velvet-axis",
    name: "Velvet Axis",
    focus: "Creator-led drops, royalty-friendly release structure, and cast metadata.",
    status: "Open for baseline buildout",
  },
  {
    slug: "after-hours-unit",
    name: "After Hours Unit",
    focus: "Operational placeholder for studio dashboards, publishing, and cast rosters.",
    status: "Internal starter profile",
  },
];

export const videos: VideoSummary[] = [
  {
    slug: "midnight-premiere",
    title: "Midnight Premiere",
    studio: "Midnight Room",
    status: "Featured",
    summary: "Placeholder release card for browse shelves, studio pages, and homepage modules.",
  },
  {
    slug: "velvet-spotlight",
    title: "Velvet Spotlight",
    studio: "Velvet Axis",
    status: "Draft shell",
    summary: "Simple baseline for future metadata, previews, creator credits, and access logic.",
  },
  {
    slug: "royalty-cut",
    title: "Royalty Cut",
    studio: "After Hours Unit",
    status: "Coming soon",
    summary: "A content detail route that keeps the site feeling complete while implementation catches up.",
  },
];

export const dashboardNavigation: DashboardNavItem[] = [
  {
    href: "/dashboard",
    label: "Overview",
    description: "Creator home for uploads, publishing, and profile activity.",
  },
  {
    href: "/dashboard/profile",
    label: "Profile",
    description: "Starter settings for identity, banner, and bio modules.",
  },
  {
    href: "/dashboard/content",
    label: "Content",
    description: "Creator content hub for uploads, library visibility, and status.",
  },
  {
    href: "/dashboard/uploads",
    label: "Uploads",
    description: "Submit new long-form videos and track transfer progress.",
  },
  {
    href: "/dashboard/videos",
    label: "My Videos",
    description: "Manage creator uploads across draft, processing, and live states.",
  },
  {
    href: "/dashboard/earnings",
    label: "Earnings",
    description: "Placeholder payouts and revenue summary view.",
  },
  {
    href: "/dashboard/royalties",
    label: "Royalties",
    description: "Reserved for split logic, statements, and transparency tools.",
  },
  {
    href: "/dashboard/settings",
    label: "Settings",
    description: "Account and workflow preferences shell.",
  },
];

export const studioDashboardNavigation: DashboardNavItem[] = [
  {
    href: "/studio-dashboard",
    label: "Overview",
    description: "Studio operations overview baseline.",
  },
  {
    href: "/studio-dashboard/videos",
    label: "Videos",
    description: "Publishing queue and release shelf placeholder.",
  },
  {
    href: "/studio-dashboard/cast",
    label: "Cast",
    description: "Talent roster and contributor management placeholder.",
  },
  {
    href: "/studio-dashboard/royalties",
    label: "Royalties",
    description: "Split tracking and studio payout surface.",
  },
  {
    href: "/studio-dashboard/settings",
    label: "Settings",
    description: "Studio profile, controls, and future permissions.",
  },
];

export const adminNavigation: DashboardNavItem[] = [
  {
    href: "/admin",
    label: "Overview",
    description: "Admin control panel baseline.",
  },
  {
    href: "/admin/creators",
    label: "Creators",
    description: "Review queue and profile oversight placeholder.",
  },
  {
    href: "/admin/videos",
    label: "Videos",
    description: "Moderation and publishing operations shell.",
  },
  {
    href: "/admin/studios",
    label: "Studios",
    description: "Studio approvals and management baseline.",
  },
  {
    href: "/admin/royalties",
    label: "Royalties",
    description: "Internal finance and payout review surface.",
  },
  {
    href: "/admin/reports",
    label: "Reports",
    description: "Support, abuse, and compliance handling placeholder.",
  },
];

export const creatorVideos: CreatorVideoRecord[] = [
  {
    id: "vid_001",
    slug: "after-dark-session",
    title: "After Dark Session",
    description:
      "A long-form creator upload with polished presentation, extended runtime, and premium access positioning.",
    creatorSlug: "luna-vale",
    creatorName: "Luna Vale",
    tags: ["cinematic", "late-night", "featured"],
    price: 19,
    previewLengthSeconds: 75,
    durationMinutes: 28,
    status: "Published",
    access: "Premium",
    uploadProgress: 100,
    updatedAt: "Updated 2 hours ago",
    cast: ["Luna Vale"],
    streamAssetStatus: "ready",
    streamUid: "stream_after_dark_session",
  },
  {
    id: "vid_002",
    slug: "private-room-cut",
    title: "Private Room Cut",
    description:
      "Creator-owned release prepared for premium playback with profile-led discovery and cast visibility.",
    creatorSlug: "nico-voss",
    creatorName: "Nico Voss",
    tags: ["studio-style", "premium", "long-form"],
    price: 15,
    previewLengthSeconds: 60,
    durationMinutes: 24,
    status: "Processing",
    access: "Premium",
    uploadProgress: 82,
    updatedAt: "Processing now",
    cast: ["Nico Voss", "Rhea Onyx"],
    streamAssetStatus: "processing",
    streamUid: "stream_private_room_cut",
  },
  {
    id: "vid_003",
    slug: "velvet-entry",
    title: "Velvet Entry",
    description:
      "A creator upload prepared for scheduled publishing with flexible preview controls and metadata editing.",
    creatorSlug: "rhea-onyx",
    creatorName: "Rhea Onyx",
    tags: ["editorial", "launch", "profile"],
    price: 0,
    previewLengthSeconds: 45,
    durationMinutes: 21,
    status: "Draft",
    access: "Free",
    uploadProgress: 14,
    updatedAt: "Saved today",
    cast: ["Rhea Onyx"],
    streamAssetStatus: "awaiting_upload",
  },
  {
    id: "vid_004",
    slug: "members-only-room",
    title: "Members Only Room",
    description:
      "A locked release prepared for gated access once playback and rights settings are finalized.",
    creatorSlug: "luna-vale",
    creatorName: "Luna Vale",
    tags: ["locked", "premium", "exclusive"],
    price: 24,
    previewLengthSeconds: 90,
    durationMinutes: 33,
    status: "Locked",
    access: "Premium",
    uploadProgress: 100,
    updatedAt: "Locked for review",
    cast: ["Luna Vale", "Nico Voss"],
    streamAssetStatus: "ready",
    streamUid: "stream_members_only_room",
  },
];

export const cloudflareStreamConfig: CloudflareStreamUploadConfig = {
  uploadMode: "direct-creator-upload",
  supportsTus: true,
  requiresSignedPlayback: false,
  moderationPipelineEnabled: false,
};
