export const HERB_CATEGORIES = [
  "Adaptogen",
  "Anti-inflammatory",
  "Cognitive",
  "Digestive",
  "Immunity",
  "Nootropic",
  "Respiratory",
  "Skin & Detox",
  "Women's Health",
  "Men's Health",
  "Sleep & Relaxation",
  "Energy & Vitality",
] as const;

export type HerbCategory = (typeof HERB_CATEGORIES)[number];
