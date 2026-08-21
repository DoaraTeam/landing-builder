// Smart-merges a component's old (user-edited) config into a newly-selected
// template's config when the user changes a component's template — keeps
// user content (text, images, arrays, CTAs, background/animation/spacing
// customizations) instead of overwriting them with the new template's
// defaults. Extracted verbatim from EditableLandingPage.tsx.
export function mergeConfigs(
  oldConfig: Record<string, unknown>,
  newConfig: Record<string, unknown>
): Record<string, unknown> {
  if (!oldConfig || !newConfig) return newConfig;

  const merged = { ...newConfig }; // Start with new template structure

  // Preserve important user-edited fields
  const preserveFields = [
    "title",
    "subtitle",
    "description",
    "content",
    "image",
    "logo",
    "tagline",
    "email",
    "phone",
    "address",
    "copyright",
  ];

  // Copy preserved fields from old config if they exist and are not empty
  preserveFields.forEach((field) => {
    if (oldConfig[field] && oldConfig[field] !== "") {
      merged[field] = oldConfig[field];
    }
  });

  // Special handling for arrays (features, testimonials, plans, etc.)
  if (Array.isArray(oldConfig.features) && Array.isArray(newConfig.features)) {
    // Keep old features if user has customized them, otherwise use new template
    if (oldConfig.features.length > 0) {
      merged.features = oldConfig.features;
    }
  }

  if (Array.isArray(oldConfig.testimonials) && Array.isArray(newConfig.testimonials)) {
    if (oldConfig.testimonials.length > 0) {
      merged.testimonials = oldConfig.testimonials;
    }
  }

  if (Array.isArray(oldConfig.plans) && Array.isArray(newConfig.plans)) {
    if (oldConfig.plans.length > 0) {
      merged.plans = oldConfig.plans;
    }
  }

  if (Array.isArray(oldConfig.stats) && Array.isArray(newConfig.stats)) {
    if (oldConfig.stats.length > 0) {
      merged.stats = oldConfig.stats;
    }
  }

  if (Array.isArray(oldConfig.faqs) && Array.isArray(newConfig.faqs)) {
    if (oldConfig.faqs.length > 0) {
      merged.faqs = oldConfig.faqs;
    }
  }

  if (Array.isArray(oldConfig.members) && Array.isArray(newConfig.members)) {
    if (oldConfig.members.length > 0) {
      merged.members = oldConfig.members;
    }
  }

  if (Array.isArray(oldConfig.images) && Array.isArray(newConfig.images)) {
    if (oldConfig.images.length > 0) {
      merged.images = oldConfig.images;
    }
  }

  if (Array.isArray(oldConfig.logos) && Array.isArray(newConfig.logos)) {
    if (oldConfig.logos.length > 0) {
      merged.logos = oldConfig.logos;
    }
  }

  if (Array.isArray(oldConfig.columns) && Array.isArray(newConfig.columns)) {
    if (oldConfig.columns.length > 0) {
      merged.columns = oldConfig.columns;
    }
  }

  if (Array.isArray(oldConfig.tabs) && Array.isArray(newConfig.tabs)) {
    if (oldConfig.tabs.length > 0) {
      merged.tabs = oldConfig.tabs;
    }
  }

  if (Array.isArray(oldConfig.fields) && Array.isArray(newConfig.fields)) {
    if (oldConfig.fields.length > 0) {
      merged.fields = oldConfig.fields;
    }
  }

  // Preserve CTA buttons if user customized them
  if (oldConfig.primaryCTA) {
    merged.primaryCTA = oldConfig.primaryCTA;
  }

  if (oldConfig.secondaryCTA) {
    merged.secondaryCTA = oldConfig.secondaryCTA;
  }

  if (oldConfig.cta) {
    merged.cta = oldConfig.cta;
  }

  if (oldConfig.ctaButton) {
    merged.ctaButton = oldConfig.ctaButton;
  }

  // Preserve background if customized (but allow new template's background if old was default)
  if (oldConfig.background && typeof oldConfig.background === "object") {
    const bg = oldConfig.background as { type?: string; color?: string };
    if (bg.type && bg.type !== "solid") {
      merged.background = oldConfig.background;
    } else if (bg.color && bg.color !== "#ffffff" && bg.color !== "#f9fafb") {
      // Keep custom colors
      merged.background = oldConfig.background;
    }
  }

  // Preserve animation settings if user customized them
  if (oldConfig.animation && typeof oldConfig.animation === "object") {
    const anim = oldConfig.animation as { type?: string };
    if (anim.type && anim.type !== "none") {
      merged.animation = oldConfig.animation;
    }
  }

  // Preserve spacing if customized
  if (oldConfig.spacing) {
    merged.spacing = oldConfig.spacing;
  }

  // Preserve contactInfo if exists
  if (oldConfig.contactInfo) {
    merged.contactInfo = oldConfig.contactInfo;
  }

  // Preserve social links if exists
  if (oldConfig.social && Array.isArray(oldConfig.social) && oldConfig.social.length > 0) {
    merged.social = oldConfig.social;
  }

  // Preserve video URL if exists
  if (oldConfig.videoUrl) {
    merged.videoUrl = oldConfig.videoUrl;
  }

  return merged;
}
