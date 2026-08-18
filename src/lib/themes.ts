import { Theme } from "@/types/landing";

/**
 * Predefined themes collection
 */
export const themes: Record<string, Theme> = {
  // Modern Blue Theme
  modern: {
    name: "Modern Blue",
    colors: {
      primary: "#3B82F6", // Blue 500
      secondary: "#8B5CF6", // Purple 500
      accent: "#06B6D4", // Cyan 500
      background: "#FFFFFF",
      surface: "#F9FAFB", // Gray 50
      text: "#111827", // Gray 900
      textMuted: "#6B7280", // Gray 500
    },
    fonts: {
      heading: "Inter, system-ui, sans-serif",
      body: "Inter, system-ui, sans-serif",
    },
    borderRadius: "0.5rem",
    shadows: "modern",
  },

  // Professional Dark Theme
  dark: {
    name: "Professional Dark",
    colors: {
      primary: "#60A5FA", // Blue 400
      secondary: "#A78BFA", // Purple 400
      accent: "#34D399", // Emerald 400
      background: "#0F172A", // Slate 900
      surface: "#1E293B", // Slate 800
      text: "#F8FAFC", // Slate 50
      textMuted: "#94A3B8", // Slate 400
    },
    fonts: {
      heading: "Inter, system-ui, sans-serif",
      body: "Inter, system-ui, sans-serif",
    },
    borderRadius: "0.5rem",
    shadows: "lg",
  },

  // Vibrant Gradient Theme
  vibrant: {
    name: "Vibrant Gradient",
    colors: {
      primary: "#EC4899", // Pink 500
      secondary: "#F59E0B", // Amber 500
      accent: "#8B5CF6", // Purple 500
      background: "#FFFFFF",
      surface: "#FEF3C7", // Amber 100
      text: "#1F2937", // Gray 800
      textMuted: "#6B7280", // Gray 500
    },
    fonts: {
      heading: "Poppins, sans-serif",
      body: "Open Sans, sans-serif",
    },
    borderRadius: "1rem",
    shadows: "xl",
  },

  // Minimal Clean Theme
  minimal: {
    name: "Minimal Clean",
    colors: {
      primary: "#000000",
      secondary: "#404040", // Gray 700
      accent: "#737373", // Gray 500
      background: "#FFFFFF",
      surface: "#FAFAFA", // Gray 50
      text: "#0A0A0A",
      textMuted: "#737373",
    },
    fonts: {
      heading: "Helvetica Neue, Arial, sans-serif",
      body: "Helvetica Neue, Arial, sans-serif",
    },
    borderRadius: "0.25rem",
    shadows: "sm",
  },

  // Nature Green Theme
  nature: {
    name: "Nature Green",
    colors: {
      primary: "#10B981", // Emerald 500
      secondary: "#059669", // Emerald 600
      accent: "#84CC16", // Lime 500
      background: "#FFFFFF",
      surface: "#F0FDF4", // Green 50
      text: "#064E3B", // Emerald 900
      textMuted: "#6B7280", // Gray 500
    },
    fonts: {
      heading: "Merriweather, Georgia, serif",
      body: "Lato, sans-serif",
    },
    borderRadius: "0.75rem",
    shadows: "md",
  },

  // Sunset Orange Theme
  sunset: {
    name: "Sunset Orange",
    colors: {
      primary: "#F97316", // Orange 500
      secondary: "#DC2626", // Red 600
      accent: "#FACC15", // Yellow 400
      background: "#FFF7ED", // Orange 50
      surface: "#FFFFFF",
      text: "#1C1917", // Stone 900
      textMuted: "#78716C", // Stone 500
    },
    fonts: {
      heading: "Playfair Display, serif",
      body: "Roboto, sans-serif",
    },
    borderRadius: "0.5rem",
    shadows: "lg",
  },

  // Ocean Blue Theme
  ocean: {
    name: "Ocean Blue",
    colors: {
      primary: "#0EA5E9", // Sky 500
      secondary: "#0284C7", // Sky 600
      accent: "#06B6D4", // Cyan 500
      background: "#F0F9FF", // Sky 50
      surface: "#FFFFFF",
      text: "#0C4A6E", // Sky 900
      textMuted: "#64748B", // Slate 500
    },
    fonts: {
      heading: "Montserrat, sans-serif",
      body: "Source Sans Pro, sans-serif",
    },
    borderRadius: "0.5rem",
    shadows: "md",
  },

  // Elegant Purple Theme
  elegant: {
    name: "Elegant Purple",
    colors: {
      primary: "#9333EA", // Purple 600
      secondary: "#7C3AED", // Violet 600
      accent: "#C084FC", // Purple 400
      background: "#FEFEFE",
      surface: "#FAF5FF", // Purple 50
      text: "#1F2937", // Gray 800
      textMuted: "#6B7280", // Gray 500
    },
    fonts: {
      heading: "Raleway, sans-serif",
      body: "Nunito, sans-serif",
    },
    borderRadius: "0.75rem",
    shadows: "xl",
  },

  // Tech Cyan Theme
  tech: {
    name: "Tech Cyan",
    colors: {
      primary: "#06B6D4", // Cyan 500
      secondary: "#0891B2", // Cyan 600
      accent: "#22D3EE", // Cyan 400
      background: "#FFFFFF",
      surface: "#ECFEFF", // Cyan 50
      text: "#164E63", // Cyan 900
      textMuted: "#475569", // Slate 600
    },
    fonts: {
      heading: "Space Grotesk, monospace",
      body: "Inter, sans-serif",
    },
    borderRadius: "0.25rem",
    shadows: "modern",
  },

  // Warm Terracotta Theme
  warm: {
    name: "Warm Terracotta",
    colors: {
      primary: "#EA580C", // Orange 600
      secondary: "#DC2626", // Red 600
      accent: "#F59E0B", // Amber 500
      background: "#FFFBEB", // Amber 50
      surface: "#FFFFFF",
      text: "#451A03", // Amber 950
      textMuted: "#92400E", // Amber 800
    },
    fonts: {
      heading: "Crimson Text, serif",
      body: "Lora, serif",
    },
    borderRadius: "0.5rem",
    shadows: "md",
  },

  // Corporate Professional Theme
  corporate: {
    name: "Corporate Professional",
    colors: {
      primary: "#1E40AF", // Blue 800
      secondary: "#1E3A8A", // Blue 900
      accent: "#3B82F6", // Blue 500
      background: "#FFFFFF",
      surface: "#F1F5F9", // Slate 100
      text: "#0F172A", // Slate 900
      textMuted: "#475569", // Slate 600
    },
    fonts: {
      heading: "IBM Plex Sans, sans-serif",
      body: "IBM Plex Sans, sans-serif",
    },
    borderRadius: "0.25rem",
    shadows: "sm",
  },

  // Neon Futuristic Theme
  neon: {
    name: "Neon Futuristic",
    colors: {
      primary: "#A855F7", // Purple 500
      secondary: "#EC4899", // Pink 500
      accent: "#06B6D4", // Cyan 500
      background: "#0A0A0A",
      surface: "#1A1A1A",
      text: "#FAFAFA",
      textMuted: "#A3A3A3", // Neutral 400
    },
    fonts: {
      heading: "Orbitron, sans-serif",
      body: "Rajdhani, sans-serif",
    },
    borderRadius: "0rem",
    shadows: "xl",
  },

  // Pastel Soft Theme
  pastel: {
    name: "Pastel Soft",
    colors: {
      primary: "#A78BFA", // Purple 400
      secondary: "#F9A8D4", // Pink 300
      accent: "#93C5FD", // Blue 300
      background: "#FEFCE8", // Yellow 50
      surface: "#FFFFFF",
      text: "#374151", // Gray 700
      textMuted: "#9CA3AF", // Gray 400
    },
    fonts: {
      heading: "Quicksand, sans-serif",
      body: "Karla, sans-serif",
    },
    borderRadius: "1rem",
    shadows: "md",
  },

  // Bold Red Theme
  bold: {
    name: "Bold Red",
    colors: {
      primary: "#DC2626", // Red 600
      secondary: "#991B1B", // Red 800
      accent: "#FBBF24", // Amber 400
      background: "#FFFFFF",
      surface: "#FEF2F2", // Red 50
      text: "#1F2937", // Gray 800
      textMuted: "#6B7280", // Gray 500
    },
    fonts: {
      heading: "Bebas Neue, sans-serif",
      body: "Rubik, sans-serif",
    },
    borderRadius: "0.5rem",
    shadows: "lg",
  },

  // Retro Vintage Theme
  retro: {
    name: "Retro Vintage",
    colors: {
      primary: "#D97706", // Amber 600
      secondary: "#B45309", // Amber 700
      accent: "#F59E0B", // Amber 500
      background: "#FFFBEB", // Amber 50
      surface: "#FEF3C7", // Amber 100
      text: "#78350F", // Amber 900
      textMuted: "#92400E", // Amber 800
    },
    fonts: {
      heading: "Courier New, monospace",
      body: "Georgia, serif",
    },
    borderRadius: "0.25rem",
    shadows: "none",
  },
};

/**
 * Get theme by ID. Checks custom themes (e.g. from LandingConfig.themes) first,
 * so a saved custom theme takes priority over a built-in theme of the same id.
 */
export function getTheme(themeId: string, customThemes?: Record<string, Theme>): Theme {
  return customThemes?.[themeId] || themes[themeId] || themes.modern;
}

/**
 * Get all theme IDs
 */
export function getThemeIds(): string[] {
  return Object.keys(themes);
}

/**
 * Get theme preview colors (for UI display)
 */
export function getThemePreview(themeId: string) {
  const theme = getTheme(themeId);
  return {
    id: themeId,
    name: theme.name,
    primary: theme.colors.primary,
    secondary: theme.colors.secondary,
    accent: theme.colors.accent,
    background: theme.colors.background,
  };
}

/**
 * Get all themes as array for selection UI
 */
export function getThemesArray() {
  return Object.entries(themes).map(([id]) => getThemePreview(id));
}

/**
 * Apply theme CSS variables to document
 */
export function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;

  const root = document.documentElement;

  // Apply color variables
  root.style.setProperty("--color-primary", theme.colors.primary);
  root.style.setProperty("--color-secondary", theme.colors.secondary);
  root.style.setProperty("--color-accent", theme.colors.accent);
  root.style.setProperty("--color-background", theme.colors.background);
  root.style.setProperty("--color-surface", theme.colors.surface);
  root.style.setProperty("--color-text", theme.colors.text);
  root.style.setProperty("--color-text-muted", theme.colors.textMuted);

  // Apply font variables
  root.style.setProperty("--font-heading", theme.fonts.heading);
  root.style.setProperty("--font-body", theme.fonts.body);

  // Apply border radius
  root.style.setProperty("--border-radius", theme.borderRadius);

  // Apply shadow class
  root.setAttribute("data-shadow", theme.shadows);
}

/**
 * Generate CSS for theme
 */
export function generateThemeCSS(theme: Theme): string {
  return `
    :root {
      --color-primary: ${theme.colors.primary};
      --color-secondary: ${theme.colors.secondary};
      --color-accent: ${theme.colors.accent};
      --color-background: ${theme.colors.background};
      --color-surface: ${theme.colors.surface};
      --color-text: ${theme.colors.text};
      --color-text-muted: ${theme.colors.textMuted};
      
      --font-heading: ${theme.fonts.heading};
      --font-body: ${theme.fonts.body};
      
      --border-radius: ${theme.borderRadius};
    }
  `;
}
