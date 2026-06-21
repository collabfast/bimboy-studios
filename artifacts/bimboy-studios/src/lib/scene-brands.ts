import type { SceneBrand, ScenePaymentModel } from "@workspace/api-client-react";

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

export type PaymentModelInfo = {
  key: ScenePaymentModel;
  name: string;
  headline: string;
  summary: string;
  highlights: string[];
  bestFor: string;
};

export const PAYMENT_MODEL_LIST: PaymentModelInfo[] = [
  {
    key: "revenue_share",
    name: "Revenue Share",
    headline: "$200 / scene + ongoing royalties",
    summary:
      "Get paid upfront for showing up, then keep earning from the scene's lifetime performance.",
    highlights: [
      "$200 appearance fee per scene, paid on shoot day",
      "Studio holds an exclusive release window after publishing",
      "25% of net revenue for 1 year on single-performer scenes",
      "50% revenue split between performers on two-performer scenes",
    ],
    bestFor: "Performers betting on a scene's long-term reach.",
  },
  {
    key: "flat_fee",
    name: "Flat Fee",
    headline: "$400 / scene, paid in full",
    summary:
      "A bigger guaranteed payout with no strings on future revenue — done and paid.",
    highlights: [
      "$400 flat fee per scene, no revenue share",
      "Paid in full, no dependence on scene performance",
      "30-day studio exclusivity window after release",
      "Simplest option — clean, predictable payout",
    ],
    bestFor: "Performers who want certainty and a larger day-one check.",
  },
];

export const PAYMENT_MODEL_LABELS: Record<ScenePaymentModel, string> = {
  revenue_share: "Revenue Share",
  flat_fee: "Flat Fee",
};
