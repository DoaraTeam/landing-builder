import { ComponentType } from "@/types/landing";

const COMPONENT_DISPLAY_NAMES: Record<string, string> = {
  header: "Header Navigation",
  hero: "Hero Section",
  features: "Features",
  pricing: "Pricing",
  testimonials: "Testimonials",
  cta: "Call to Action",
  footer: "Footer",
  stats: "Statistics",
  team: "Team",
  faq: "FAQ",
  gallery: "Gallery",
  "logo-cloud": "Logo Cloud",
  contact: "Contact",
  content: "Content",
  newsletter: "Newsletter",
  video: "Video",
  "gym-hero": "Gym Hero",
  "gym-services": "Gym Services",
  "gym-pricing": "Gym Pricing",
  "gym-testimonials": "Gym Testimonials",
  "gym-navigation": "Gym Navigation",
  "gym-about": "Gym About",
  "gym-contact": "Gym Contact",
};

/**
 * Human-readable label for a component type, used anywhere a component needs
 * a short name in editor UI (block toolbar, page/section tree, etc).
 */
export function getComponentDisplayName(type: ComponentType | string): string {
  return COMPONENT_DISPLAY_NAMES[type] || type;
}
