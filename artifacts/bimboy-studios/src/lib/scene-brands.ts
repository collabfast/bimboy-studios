import type { SceneBrand } from "@workspace/api-client-react";

const BASE = import.meta.env.BASE_URL;

export type SceneBrandInfo = {
  key: SceneBrand;
  name: string;
  tagline: string;
  blurb: string;
  logo: string;
  accent: string;
};

export const SCENE_BRAND_LIST: SceneBrandInfo[] = [
  {
    key: "backpackboys",
    name: "BackPackBoys",
    tagline: "Street-cast, scene-ready.",
    blurb:
      "Raw, authentic shoots built around real chemistry and a loyal, fast-growing fanbase. We bring the crew, the set, and the audience — you bring the heat.",
    logo: `${BASE}images/brands/backpackboys-logo.png`,
    accent: "from-amber-400 to-orange-500",
  },
  {
    key: "bimboys_badbitches",
    name: "BimBoys & Bad Bitches",
    tagline: "Glossy, loud, unapologetic.",
    blurb:
      "Our flagship premium label for high-production collabs and headline drops. Bold casting, big reach, and the polish that turns scenes into events.",
    logo: `${BASE}images/brands/bimboys-badbitches-logo.png`,
    accent: "from-pink-500 to-violet-500",
  },
];

export const SCENE_BRAND_LABELS: Record<SceneBrand, string> = {
  backpackboys: "BackPackBoys",
  bimboys_badbitches: "BimBoys & Bad Bitches",
};

export type DistributionRow = {
  label: string;
  performer: string;
  platform: string;
};

export type DistributionGroup = {
  key: string;
  title: string;
  subtitle: string;
  rows: DistributionRow[];
};

export const REVENUE_DISTRIBUTION: DistributionGroup[] = [
  {
    key: "studio",
    title: "Studio account videos",
    subtitle: "Scenes produced and released under our studio brands.",
    rows: [
      {
        label: "Single-performer scene",
        performer: "25% of net revenue for 1 year",
        platform: "75% to BimBoy",
      },
      {
        label: "Two-performer scene",
        performer: "50% of net revenue, split evenly — 25% each",
        platform: "50% to BimBoy",
      },
      {
        label: "Three or more performers",
        performer: "50% revenue pool, divided evenly between all performers",
        platform: "50% to BimBoy",
      },
    ],
  },
  {
    key: "creator",
    title: "Creator account videos",
    subtitle: "Content you publish to your own creator profile.",
    rows: [
      {
        label: "Any number of creators",
        performer: "80% revenue pool, divided evenly between all creators",
        platform: "20% to BimBoy",
      },
    ],
  },
];
