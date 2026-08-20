// ========================
// CORE TYPES
// ========================

/**
 * Component types available in the builder
 */
export type ComponentType =
  | "header"
  | "hero"
  | "features"
  | "pricing"
  | "testimonials"
  | "cta"
  | "footer"
  | "stats"
  | "team"
  | "faq"
  | "gallery"
  | "logo-cloud"
  | "contact"
  | "content"
  | "newsletter"
  | "video"
  | "gym-hero"
  | "gym-services"
  | "gym-pricing"
  | "gym-testimonials"
  | "gym-navigation"
  | "gym-about"
  | "gym-contact";

/**
 * Background configuration for components
 */
export interface BackgroundConfig {
  type: "solid" | "gradient" | "image";
  color?: string; // Theme color key or hex
  gradient?: {
    from: string;
    to: string;
    direction?: "to-r" | "to-l" | "to-t" | "to-b" | "to-br" | "to-bl";
  };
  image?: {
    url: string;
    overlay?: string; // Overlay color with opacity (e.g., "rgba(0,0,0,0.5)")
    position?: string; // CSS background-position (e.g., "center", "top left")
    size?: string; // CSS background-size (e.g., "cover", "contain")
  };
}

/**
 * Animation configuration
 */
export interface AnimationConfig {
  type: "none" | "fadeIn" | "fadeInUp" | "fadeInDown" | "slideInLeft" | "slideInRight" | "zoomIn";
  duration?: number; // milliseconds
  delay?: number; // milliseconds
}

/**
 * Spacing configuration
 */
export interface SpacingConfig {
  padding?: "none" | "sm" | "md" | "lg" | "xl" | "2xl";
  margin?: "none" | "sm" | "md" | "lg" | "xl" | "2xl";
}

/**
 * Container width options
 */
export type ContainerWidth =
  | "xs" // 448px - Extra small, perfect for forms
  | "sm" // 512px - Small, good for focused content
  | "md" // 672px - Medium, blog posts
  | "narrow" // 768px - Narrow, single column content
  | "lg" // 896px - Large, articles
  | "default" // 1280px - Default container
  | "wide" // 1536px - Wide layouts
  | "xl" // 1600px - Extra wide
  | "2xl" // 1800px - Ultra wide
  | "full" // Full width with padding
  | "fullscreen"; // True fullscreen, no padding

// ========================
// COMPONENT CONFIGS
// ========================

/**
 * Header tab item
 */
export interface HeaderTab {
  id: string;
  text: string;
  link: string; // Can be: "#section-id" for scroll or "/slug/subpage" for navigation
}

/**
 * Header section configuration
 */
export interface HeaderConfig {
  logo?: {
    type: "text" | "image";
    text?: string;
    image?: string;
    link?: string;
  };
  tabs: HeaderTab[];
  ctaButton?: {
    text: string;
    link: string;
    style?: "primary" | "secondary" | "outline";
  };
  position?: "fixed" | "sticky" | "static";
  transparent?: boolean; // Transparent on scroll top
  background: BackgroundConfig;
  spacing?: SpacingConfig;
  animation?: AnimationConfig;
}

/**
 * Hero section configuration
 */
export interface HeroConfig {
  title: string;
  subtitle: string;
  description: string;
  primaryCTA?: {
    text: string;
    link: string; // Can be: "#section-id" for scroll or "/slug/subpage" for navigation
    style?: "primary" | "secondary" | "outline";
  };
  secondaryCTA?: {
    text: string;
    link: string; // Can be: "#section-id" for scroll or "/slug/subpage" for navigation
    style?: "primary" | "secondary" | "outline";
  };
  image?: string;
  alignment?: "left" | "center" | "right";
  containerWidth?: ContainerWidth;
  background: BackgroundConfig;
  animation: AnimationConfig;
  spacing: SpacingConfig;
}

/**
 * Feature item
 */
export interface FeatureItem {
  id: string;
  icon?: string; // Icon name or emoji
  title: string;
  description: string;
  image?: string;
}

/**
 * Features section configuration
 */
export interface FeaturesConfig {
  title: string;
  subtitle?: string;
  description?: string;
  features: FeatureItem[];
  layout?: "grid" | "list" | "carousel";
  columns?: 2 | 3 | 4;
  containerWidth?: ContainerWidth;
  background: BackgroundConfig;
  animation: AnimationConfig;
  spacing: SpacingConfig;
}

/**
 * Pricing plan
 */
export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: string;
  period?: string; // e.g., "/month", "/year"
  features: string[];
  highlighted?: boolean;
  badge?: string; // Custom badge text (e.g., "Best Value", "Most Popular")
  ctaText?: string;
  ctaLink?: string;
  cta?: {
    text: string;
    link: string;
  };
}

/**
 * Pricing section configuration
 */
export interface PricingConfig {
  title: string;
  subtitle?: string;
  description?: string;
  plans: PricingPlan[];
  layout?: "grid" | "carousel";
  containerWidth?: ContainerWidth;
  background: BackgroundConfig;
  animation: AnimationConfig;
  spacing: SpacingConfig;
}

/**
 * Testimonial item
 */
export interface TestimonialItem {
  id: string;
  name?: string;
  author?: string; // Alternative to name
  role?: string;
  company?: string;
  avatar?: string;
  rating?: number; // 1-5
  text?: string;
  content?: string; // Alternative to text
}

/**
 * Testimonials section configuration
 */
export interface TestimonialsConfig {
  title: string;
  subtitle?: string;
  description?: string;
  testimonials: TestimonialItem[];
  layout?: "grid" | "carousel" | "masonry";
  columns?: 2 | 3 | 4;
  containerWidth?: ContainerWidth;
  background: BackgroundConfig;
  animation: AnimationConfig;
  spacing: SpacingConfig;
}

/**
 * CTA (Call to Action) section configuration
 */
export interface CTAConfig {
  title: string;
  description: string;
  primaryCTA?: {
    text: string;
    link: string; // Can be: "#section-id" for scroll or "/slug/subpage" for navigation
    style?: "primary" | "secondary" | "outline";
  };
  secondaryCTA?: {
    text: string;
    link: string; // Can be: "#section-id" for scroll or "/slug/subpage" for navigation
    style?: "primary" | "secondary" | "outline";
  };
  alignment?: "left" | "center" | "right";
  containerWidth?: ContainerWidth;
  background: BackgroundConfig;
  animation: AnimationConfig;
  spacing: SpacingConfig;
}

/**
 * Footer link
 */
export interface FooterLink {
  text: string;
  link: string;
}

/**
 * Footer column
 */
export interface FooterColumn {
  id?: string;
  title: string;
  links?: FooterLink[];
  items?: FooterLink[]; // Alternative to links
}

/**
 * Social link
 */
export interface SocialLink {
  platform: "facebook" | "twitter" | "instagram" | "linkedin" | "youtube" | "github";
  url?: string;
  link?: string; // Alternative to url
}

/**
 * Footer configuration
 */
export interface FooterConfig {
  logo?: {
    text: string;
    image: string;
  };
  description?: string; // Alternative to tagline
  tagline?: string;
  columns?: FooterColumn[];
  links?: FooterColumn[]; // Alternative to columns
  social?: SocialLink[];
  copyright?: string;
  background: BackgroundConfig;
  spacing: SpacingConfig;
  animation?: AnimationConfig;
}

// ========================
// THEME SYSTEM
// ========================

/**
 * Color scheme for theme
 */
export interface ColorScheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textMuted: string;
}

/**
 * Font scheme for theme
 */
export interface FontScheme {
  heading: string;
  body: string;
}

/**
 * Theme configuration
 */
export interface Theme {
  name: string;
  colors: ColorScheme;
  fonts: FontScheme;
  borderRadius: string;
  shadows: "none" | "sm" | "md" | "lg" | "xl" | "modern";
}

// ========================
// PAGE & CONFIG SYSTEM
// ========================

/**
 * Open Graph configuration
 */
export interface OpenGraphConfig {
  title?: string;
  description?: string;
  url?: string;
  siteName?: string;
  images?: Array<{
    url: string;
    width?: number;
    height?: number;
    alt?: string;
  }>;
  locale?: string;
  type?:
    | "website"
    | "article"
    | "book"
    | "profile"
    | "music.song"
    | "music.album"
    | "music.playlist"
    | "music.radio_station"
    | "video.movie"
    | "video.episode"
    | "video.tv_show"
    | "video.other";
  // Article specific
  publishedTime?: string;
  modifiedTime?: string;
  expirationTime?: string;
  authors?: string[];
  section?: string;
  tags?: string[];
  // Video specific
  videos?: Array<{
    url: string;
    secureUrl?: string;
    type?: string;
    width?: number;
    height?: number;
  }>;
  // Audio specific
  audio?: Array<{
    url: string;
    secureUrl?: string;
    type?: string;
  }>;
}

/**
 * Twitter Card configuration
 */
export interface TwitterConfig {
  card?: "summary" | "summary_large_image" | "app" | "player";
  site?: string; // @username
  siteId?: string;
  creator?: string; // @username
  creatorId?: string;
  title?: string;
  description?: string;
  images?: Array<{
    url: string;
    alt?: string;
  }>;
  // App card specific
  app?: {
    id: {
      iphone?: string;
      ipad?: string;
      googleplay?: string;
    };
    url?: {
      iphone?: string;
      ipad?: string;
      googleplay?: string;
    };
    name?: string;
  };
}

/**
 * Robots meta tag configuration
 */
export interface RobotsConfig {
  index?: boolean;
  follow?: boolean;
  noarchive?: boolean;
  nosnippet?: boolean;
  noimageindex?: boolean;
  nocache?: boolean;
  notranslate?: boolean;
  maxImagePreview?: "none" | "standard" | "large";
  maxSnippet?: number;
  maxVideoPreview?: number;
  googleBot?: {
    index?: boolean;
    follow?: boolean;
    noarchive?: boolean;
    nosnippet?: boolean;
    noimageindex?: boolean;
    maxImagePreview?: "none" | "standard" | "large";
    maxSnippet?: number;
    maxVideoPreview?: number;
  };
}

/**
 * Alternate languages configuration
 */
export interface AlternateConfig {
  canonical?: string;
  languages?: Record<string, string>; // { 'en-US': '/en', 'vi-VN': '/vi' }
  media?: Record<string, string>; // Media query alternates
  types?: Record<string, string>; // Alternate types (RSS, Atom, etc.)
}

/**
 * Verification codes for search engines
 */
export interface VerificationConfig {
  google?: string;
  yandex?: string;
  yahoo?: string;
  bing?: string;
  other?: Record<string, string>;
}

/**
 * App Links configuration (for mobile apps)
 */
export interface AppLinksConfig {
  ios?: {
    url?: string;
    appStoreId?: string;
    appName?: string;
  };
  android?: {
    package?: string;
    url?: string;
    appName?: string;
  };
  web?: {
    url?: string;
    shouldFallback?: boolean;
  };
}

/**
 * Icons configuration
 */
export interface IconsConfig {
  icon?: string | Array<{ url: string; sizes?: string; type?: string }>;
  shortcut?: string | Array<{ url: string; sizes?: string; type?: string }>;
  apple?: string | Array<{ url: string; sizes?: string; type?: string }>;
  other?: Array<{
    rel: string;
    url: string;
    sizes?: string;
    type?: string;
  }>;
}

/**
 * SEO configuration for landing page (Next.js Metadata API compatible)
 */
export interface SEOConfig {
  // Basic metadata
  metaTitle: string;
  metaDescription: string;
  keywords: string[];

  // Legacy support
  ogImage?: string;
  canonical?: string;

  // Application metadata
  applicationName?: string;
  authors?: Array<{ name: string; url?: string }>;
  generator?: string;
  referrer?:
    | "no-referrer"
    | "no-referrer-when-downgrade"
    | "origin"
    | "origin-when-cross-origin"
    | "same-origin"
    | "strict-origin"
    | "strict-origin-when-cross-origin"
    | "unsafe-url";

  // Theme and appearance
  themeColor?: string | Array<{ media: string; color: string }>;
  colorScheme?: "light" | "dark" | "light dark";
  viewport?: string;

  // Open Graph
  openGraph?: OpenGraphConfig;

  // Twitter
  twitter?: TwitterConfig;

  // Robots
  robots?: RobotsConfig;

  // Alternates
  alternates?: AlternateConfig;

  // Verification
  verification?: VerificationConfig;

  // App Links
  appLinks?: AppLinksConfig;

  // Icons
  icons?: IconsConfig;

  // Web App Manifest
  manifest?: string;

  // Apple Web App
  appleWebApp?: {
    capable?: boolean;
    title?: string;
    statusBarStyle?: "default" | "black" | "black-translucent";
  };

  // Format Detection
  formatDetection?: {
    telephone?: boolean;
    date?: boolean;
    address?: boolean;
    email?: boolean;
    url?: boolean;
  };

  // iTunes App
  itunes?: {
    appId?: string;
    appArgument?: string;
  };

  // Abstract and classification
  abstract?: string;
  archives?: string[];
  category?: string;
  classification?: string;
}

/**
 * Component configuration (generic wrapper)
 */
export interface ComponentConfig {
  id: string;
  type: ComponentType;
  order: number;
  visible: boolean;
  config:
    | HeaderConfig
    | HeroConfig
    | FeaturesConfig
    | PricingConfig
    | TestimonialsConfig
    | CTAConfig
    | FooterConfig
    | Record<string, unknown>; // Allow custom component configs
}

/**
 * Navigation link
 */
export interface NavigationLink {
  text: string;
  link: string;
}

/**
 * Navigation configuration
 */
export interface Navigation {
  logo?: string;
  links: NavigationLink[];
}

/**
 * Loading spinner type
 */
export type LoadingSpinnerType =
  | "spin"
  | "pulse"
  | "dots"
  | "bounce"
  | "square-corners"
  | "dual-ring"
  | "bars"
  | "ripple";

/**
 * Loading configuration
 */
export interface LoadingConfig {
  enabled: boolean;
  type: LoadingSpinnerType;
  color?: string;
  duration?: number; // milliseconds, default 1000
  minDuration?: number; // minimum loading time in ms, default 500
}

/**
 * Sub-page configuration for multi-page landing
 */
export interface SubPage {
  id: string;
  title: string;
  slug: string; // Relative slug (will be combined with parent)
  icon?: string; // Icon name or emoji
  description?: string;
  components: ComponentConfig[];
  order: number;
  visible: boolean;
  // Optional — sub-pages created before this existed (or never edited since)
  // fall back to the parent page's SEOConfig with title/description
  // overridden, same as before. Set this to give a sub-page fully
  // independent SEO (its own robots/canonical/OG/Twitter/verification/etc.).
  seo?: SEOConfig;
}

/**
 * Page navigation style
 */
export type PageNavigationStyle =
  | "tabs" // Horizontal tabs
  | "sidebar" // Vertical sidebar
  | "dropdown" // Dropdown menu
  | "pills"; // Pill-style tabs

/**
 * Page navigation configuration
 */
export interface PageNavigation {
  enabled: boolean;
  style: PageNavigationStyle;
  position?: "top" | "left" | "right"; // For sidebar
  showIcons?: boolean;
  sticky?: boolean;
}

/**
 * Landing page configuration
 */
export interface LandingPage {
  id: string;
  title: string;
  description: string;
  slug: string;
  theme: string; // Reference to theme ID
  seo: SEOConfig;
  components: ComponentConfig[];
  loading?: LoadingConfig;
  createdAt?: string;
  updatedAt?: string;
  status?: "draft" | "published" | "archived";
  // Multi-page support. Whether a page "is" multi-page is derived from
  // whether subPages is non-empty — there's no separate stored flag.
  subPages?: SubPage[];
  navigation?: PageNavigation;
}

/**
 * Metadata for landing config
 */
export interface Metadata {
  lastUpdated: string;
  totalPages: number;
  version: string;
}

/**
 * Version history entry for landing pages
 */
export interface LandingPageVersion {
  id: string;
  name: string;
  page: LandingPage;
  createdAt: string;
  description?: string;
}

/**
 * A single page's full record: every page has its own draft/published split
 * and version history (versions live separately, keyed by this entry's id —
 * see landing-config-store.ts), unified across what used to be the legacy
 * `pages` map (flat, always-live) and the `currentLanding` singleton
 * (draft/published/versions, but only ever one site).
 */
export interface PageEntry {
  id: string;
  // The project/site's own identity — independent of `draft.title`, which is
  // just the *main page's* own title (same kind of thing a sub-page's title
  // is). Renaming the project never touches draft/published content, so it
  // needs no save-then-publish cycle.
  name: string;
  draft: LandingPage;
  published: LandingPage | null;
  publishedAt?: string;
  // Track which version is currently being edited (if any)
  activeVersionId?: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Lightweight projection of a PageEntry for the /pages dashboard grid — no
 * component trees, so listing every page doesn't require shipping their full
 * content.
 */
export interface PageSummary {
  id: string;
  title: string;
  description: string;
  slug: string;
  isMultiPage: boolean;
  status?: LandingPage["status"];
  createdAt: string;
  updatedAt: string;
  isPublished: boolean;
}

/**
 * Complete landing configuration (root of landing-config.json)
 */
export interface LandingConfig {
  version: string;
  metadata: Metadata;
  themes: Record<string, Theme>;
  // Every page is equal — each gets its own public route at its own slug.
  // Which real-world domain points at which page's slug is entirely up to
  // whoever deploys this app; not this app's concern.
  pages: Record<string, PageEntry>;
  navigation?: Navigation;
}

// ========================
// TYPE GUARDS
// ========================

export function isHeroConfig(config: unknown): config is HeroConfig {
  return (
    typeof config === "object" &&
    config !== null &&
    "title" in config &&
    "subtitle" in config &&
    "description" in config &&
    typeof config.title === "string" &&
    typeof config.subtitle === "string" &&
    typeof config.description === "string"
  );
}

export function isFeaturesConfig(config: unknown): config is FeaturesConfig {
  return (
    typeof config === "object" &&
    config !== null &&
    "title" in config &&
    "features" in config &&
    typeof config.title === "string" &&
    Array.isArray(config.features)
  );
}

export function isPricingConfig(config: unknown): config is PricingConfig {
  return (
    typeof config === "object" &&
    config !== null &&
    "title" in config &&
    "plans" in config &&
    typeof config.title === "string" &&
    Array.isArray(config.plans)
  );
}

export function isTestimonialsConfig(config: unknown): config is TestimonialsConfig {
  return (
    typeof config === "object" &&
    config !== null &&
    "title" in config &&
    "testimonials" in config &&
    typeof config.title === "string" &&
    Array.isArray(config.testimonials)
  );
}

export function isCTAConfig(config: unknown): config is CTAConfig {
  return (
    typeof config === "object" &&
    config !== null &&
    "title" in config &&
    "description" in config &&
    typeof config.title === "string" &&
    typeof config.description === "string"
  );
}

export function isFooterConfig(config: unknown): config is FooterConfig {
  return (
    typeof config === "object" &&
    config !== null &&
    "columns" in config &&
    Array.isArray(config.columns)
  );
}

export function isValidComponentType(type: string): type is ComponentType {
  const validTypes: ComponentType[] = [
    "hero",
    "features",
    "pricing",
    "testimonials",
    "cta",
    "footer",
    "gym-hero",
    "gym-services",
    "gym-pricing",
    "gym-testimonials",
    "gym-navigation",
    "gym-about",
    "gym-contact",
  ];
  return validTypes.includes(type as ComponentType);
}

// ========================
// UTILITY TYPES
// ========================

/**
 * Props for component renderer
 */
export interface ComponentRendererProps {
  component: ComponentConfig;
  theme?: Theme;
}

/**
 * Props for editable components (admin mode)
 */
export interface EditableComponentProps {
  component: ComponentConfig;
  theme?: Theme;
  onUpdate: (updated: ComponentConfig) => void;
  onDelete: (id: string) => void;
  isSelected?: boolean;
  onSelect?: () => void;
}
