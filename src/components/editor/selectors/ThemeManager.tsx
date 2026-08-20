"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, Palette, Paintbrush, Type, Layout, Save } from "lucide-react";
import { getThemesArray, getTheme } from "@/lib/themes";
import { Theme } from "@/types/landing";

interface ThemeManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentThemeId: string;
  onThemeChange: (themeId: string) => void;
  onSaveTheme: (theme: Theme, themeId: string) => void;
}

/**
 * Theme — one Sheet covering both ways to pick a theme: browse presets, or
 * build a custom one. Both end the same way (an applied theme), so they
 * share one panel instead of being two separate menu entries/sheets.
 */
export default function ThemeManager({
  open,
  onOpenChange,
  currentThemeId,
  onThemeChange,
  onSaveTheme,
}: ThemeManagerProps) {
  const [activeTab, setActiveTab] = useState<"presets" | "custom">("presets");

  // --- Presets tab state ---
  const [selectedThemeId, setSelectedThemeId] = useState(currentThemeId);
  const [hoveredThemeId, setHoveredThemeId] = useState<string | null>(null);
  const themes = getThemesArray();

  const handleSelectTheme = (themeId: string) => {
    setSelectedThemeId(themeId);
  };

  const handleApplyTheme = () => {
    onThemeChange(selectedThemeId);
    onOpenChange(false);
  };

  const renderColorPalette = (themeId: string) => {
    const theme = getTheme(themeId);
    return (
      <div className="flex gap-1 mt-2">
        <div
          className="w-6 h-6 rounded border border-gray-200"
          style={{ backgroundColor: theme.colors.primary }}
          title="Primary"
        />
        <div
          className="w-6 h-6 rounded border border-gray-200"
          style={{ backgroundColor: theme.colors.secondary }}
          title="Secondary"
        />
        <div
          className="w-6 h-6 rounded border border-gray-200"
          style={{ backgroundColor: theme.colors.accent }}
          title="Accent"
        />
        <div
          className="w-6 h-6 rounded border border-gray-200"
          style={{ backgroundColor: theme.colors.background }}
          title="Background"
        />
      </div>
    );
  };

  const renderThemePreview = (theme: Theme, themeId: string) => {
    return (
      <div
        className="w-full h-32 rounded-lg border-2 overflow-hidden"
        style={{
          backgroundColor: theme.colors.background,
          borderColor: selectedThemeId === themeId ? theme.colors.primary : "#E5E7EB",
        }}
      >
        {/* Mini preview of landing page */}
        <div className="h-full p-3 space-y-2">
          {/* Header bar */}
          <div
            className="h-2 rounded"
            style={{
              background: `linear-gradient(to right, ${theme.colors.primary}, ${theme.colors.secondary})`,
            }}
          />

          {/* Content blocks */}
          <div className="space-y-1.5">
            <div
              className="h-4 rounded"
              style={{ backgroundColor: theme.colors.surface, opacity: 0.8 }}
            />
            <div
              className="h-3 rounded w-3/4"
              style={{ backgroundColor: theme.colors.surface, opacity: 0.6 }}
            />
          </div>

          {/* Button */}
          <div className="flex gap-1 pt-1">
            <div className="h-3 w-12 rounded" style={{ backgroundColor: theme.colors.primary }} />
            <div
              className="h-3 w-12 rounded border"
              style={{ borderColor: theme.colors.primary }}
            />
          </div>
        </div>
      </div>
    );
  };

  // --- Custom tab state ---
  const [themeName, setThemeName] = useState("My Custom Theme");

  const [primaryColor, setPrimaryColor] = useState("#3B82F6");
  const [secondaryColor, setSecondaryColor] = useState("#8B5CF6");
  const [accentColor, setAccentColor] = useState("#06B6D4");
  const [backgroundColor, setBackgroundColor] = useState("#FFFFFF");
  const [surfaceColor, setSurfaceColor] = useState("#F9FAFB");
  const [textColor, setTextColor] = useState("#111827");
  const [textMutedColor, setTextMutedColor] = useState("#6B7280");

  const [headingFont, setHeadingFont] = useState("Inter, system-ui, sans-serif");
  const [bodyFont, setBodyFont] = useState("Inter, system-ui, sans-serif");

  const [borderRadius, setBorderRadius] = useState("0.5rem");
  const [shadows, setShadows] = useState<"none" | "sm" | "md" | "lg" | "xl" | "modern">("modern");

  const fontPresets = [
    { name: "Modern Sans", heading: "Inter, sans-serif", body: "Inter, sans-serif" },
    { name: "Classic Serif", heading: "Merriweather, serif", body: "Lato, sans-serif" },
    { name: "Elegant", heading: "Playfair Display, serif", body: "Roboto, sans-serif" },
    { name: "Tech", heading: "Space Grotesk, monospace", body: "Inter, sans-serif" },
    { name: "Friendly", heading: "Poppins, sans-serif", body: "Open Sans, sans-serif" },
    { name: "Corporate", heading: "IBM Plex Sans, sans-serif", body: "IBM Plex Sans, sans-serif" },
  ];

  const colorPresets = [
    { name: "Blue Harmony", primary: "#3B82F6", secondary: "#8B5CF6", accent: "#06B6D4" },
    { name: "Sunset", primary: "#F97316", secondary: "#DC2626", accent: "#FACC15" },
    { name: "Nature", primary: "#10B981", secondary: "#059669", accent: "#84CC16" },
    { name: "Purple Dream", primary: "#9333EA", secondary: "#7C3AED", accent: "#C084FC" },
    { name: "Ocean", primary: "#0EA5E9", secondary: "#0284C7", accent: "#06B6D4" },
    { name: "Bold Red", primary: "#DC2626", secondary: "#991B1B", accent: "#FBBF24" },
  ];

  const currentCustomTheme: Theme = {
    name: themeName,
    colors: {
      primary: primaryColor,
      secondary: secondaryColor,
      accent: accentColor,
      background: backgroundColor,
      surface: surfaceColor,
      text: textColor,
      textMuted: textMutedColor,
    },
    fonts: {
      heading: headingFont,
      body: bodyFont,
    },
    borderRadius,
    shadows,
  };

  const handleSaveCustom = () => {
    // Slugify the name and append a timestamp so two themes with the same
    // name (or repeated saves) never collide and silently overwrite each other.
    const slug = themeName.toLowerCase().trim().replace(/\s+/g, "-") || "custom-theme";
    const id = `${slug}-${Date.now()}`;
    onSaveTheme(currentCustomTheme, id);
    onOpenChange(false);
  };

  const applyColorPreset = (preset: (typeof colorPresets)[0]) => {
    setPrimaryColor(preset.primary);
    setSecondaryColor(preset.secondary);
    setAccentColor(preset.accent);
  };

  const applyFontPreset = (preset: (typeof fontPresets)[0]) => {
    setHeadingFont(preset.heading);
    setBodyFont(preset.body);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-3xl flex flex-col">
        <SheetHeader className="flex-shrink-0">
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-blue-600" />
            <div>
              <SheetTitle>Theme</SheetTitle>
              <SheetDescription>Pick a preset, or design your own from scratch</SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as "presets" | "custom")}
          className="flex-1 flex flex-col min-h-0 mt-4"
        >
          <TabsList className="grid w-full grid-cols-2 flex-shrink-0">
            <TabsTrigger value="presets">
              <Palette className="h-4 w-4 mr-2" />
              Presets
            </TabsTrigger>
            <TabsTrigger value="custom">
              <Paintbrush className="h-4 w-4 mr-2" />
              Custom
            </TabsTrigger>
          </TabsList>

          {/* Presets Tab */}
          <TabsContent value="presets" className="flex-1 overflow-y-auto min-h-0 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {themes.map((themePreview) => {
                const theme = getTheme(themePreview.id);
                const isSelected = selectedThemeId === themePreview.id;
                const isHovered = hoveredThemeId === themePreview.id;
                const isCurrent = currentThemeId === themePreview.id;

                return (
                  <Card
                    key={themePreview.id}
                    className={`cursor-pointer transition-all ${
                      isSelected ? "ring-2 ring-blue-500 shadow-lg" : isHovered ? "shadow-md" : ""
                    }`}
                    onClick={() => handleSelectTheme(themePreview.id)}
                    onMouseEnter={() => setHoveredThemeId(themePreview.id)}
                    onMouseLeave={() => setHoveredThemeId(null)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            {isSelected && (
                              <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                                <Check className="h-3 w-3 text-white" />
                              </div>
                            )}
                            <CardTitle className="text-lg">{theme.name}</CardTitle>
                            {isCurrent && (
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                                Current
                              </span>
                            )}
                          </div>
                          <CardDescription className="mt-1 text-xs">
                            {theme.fonts.heading.split(",")[0]} •{" "}
                            {theme.shadows === "none" ? "No shadows" : `${theme.shadows} shadows`}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-3">
                      {/* Theme Preview */}
                      {renderThemePreview(theme, themePreview.id)}

                      {/* Color Palette */}
                      <div>
                        <p className="text-xs font-medium text-gray-600 mb-1">Color Palette</p>
                        {renderColorPalette(themePreview.id)}
                      </div>

                      {/* Font Info */}
                      <div className="text-xs text-gray-500 pt-1 border-t">
                        <span className="font-medium">Heading:</span>{" "}
                        {theme.fonts.heading.split(",")[0]}
                        <br />
                        <span className="font-medium">Body:</span> {theme.fonts.body.split(",")[0]}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Custom Tab */}
          <TabsContent
            value="custom"
            className="flex-1 overflow-y-auto min-h-0 mt-4 space-y-6 pr-1"
          >
            {/* Theme Name */}
            <div className="space-y-2">
              <Label htmlFor="theme-name">Theme Name</Label>
              <Input
                id="theme-name"
                value={themeName}
                onChange={(e) => setThemeName(e.target.value)}
                placeholder="My Custom Theme"
              />
            </div>

            <Tabs defaultValue="colors" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="colors">
                  <Palette className="h-4 w-4 mr-2" />
                  Colors
                </TabsTrigger>
                <TabsTrigger value="fonts">
                  <Type className="h-4 w-4 mr-2" />
                  Typography
                </TabsTrigger>
                <TabsTrigger value="styling">
                  <Layout className="h-4 w-4 mr-2" />
                  Styling
                </TabsTrigger>
              </TabsList>

              {/* Colors Tab */}
              <TabsContent value="colors" className="space-y-6 mt-6">
                {/* Color Presets */}
                <div>
                  <Label className="mb-3 block">Quick Color Presets</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {colorPresets.map((preset) => (
                      <Button
                        key={preset.name}
                        variant="outline"
                        size="sm"
                        onClick={() => applyColorPreset(preset)}
                        className="justify-start"
                      >
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1">
                            <div
                              className="w-4 h-4 rounded border"
                              style={{ backgroundColor: preset.primary }}
                            />
                            <div
                              className="w-4 h-4 rounded border"
                              style={{ backgroundColor: preset.secondary }}
                            />
                            <div
                              className="w-4 h-4 rounded border"
                              style={{ backgroundColor: preset.accent }}
                            />
                          </div>
                          <span className="text-xs">{preset.name}</span>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Primary Colors */}
                <Card>
                  <CardContent className="p-4 space-y-4">
                    <h3 className="font-semibold text-sm">Brand Colors</h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="primary-color">Primary Color</Label>
                        <div className="flex gap-2">
                          <Input
                            id="primary-color"
                            type="color"
                            value={primaryColor}
                            onChange={(e) => setPrimaryColor(e.target.value)}
                            className="w-20 h-10"
                          />
                          <Input
                            type="text"
                            value={primaryColor}
                            onChange={(e) => setPrimaryColor(e.target.value)}
                            className="flex-1"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="secondary-color">Secondary Color</Label>
                        <div className="flex gap-2">
                          <Input
                            id="secondary-color"
                            type="color"
                            value={secondaryColor}
                            onChange={(e) => setSecondaryColor(e.target.value)}
                            className="w-20 h-10"
                          />
                          <Input
                            type="text"
                            value={secondaryColor}
                            onChange={(e) => setSecondaryColor(e.target.value)}
                            className="flex-1"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="accent-color">Accent Color</Label>
                        <div className="flex gap-2">
                          <Input
                            id="accent-color"
                            type="color"
                            value={accentColor}
                            onChange={(e) => setAccentColor(e.target.value)}
                            className="w-20 h-10"
                          />
                          <Input
                            type="text"
                            value={accentColor}
                            onChange={(e) => setAccentColor(e.target.value)}
                            className="flex-1"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Background Colors */}
                <Card>
                  <CardContent className="p-4 space-y-4">
                    <h3 className="font-semibold text-sm">Background & Surface Colors</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="bg-color">Background Color</Label>
                        <div className="flex gap-2">
                          <Input
                            id="bg-color"
                            type="color"
                            value={backgroundColor}
                            onChange={(e) => setBackgroundColor(e.target.value)}
                            className="w-20 h-10"
                          />
                          <Input
                            type="text"
                            value={backgroundColor}
                            onChange={(e) => setBackgroundColor(e.target.value)}
                            className="flex-1"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="surface-color">Surface Color (Cards)</Label>
                        <div className="flex gap-2">
                          <Input
                            id="surface-color"
                            type="color"
                            value={surfaceColor}
                            onChange={(e) => setSurfaceColor(e.target.value)}
                            className="w-20 h-10"
                          />
                          <Input
                            type="text"
                            value={surfaceColor}
                            onChange={(e) => setSurfaceColor(e.target.value)}
                            className="flex-1"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Text Colors */}
                <Card>
                  <CardContent className="p-4 space-y-4">
                    <h3 className="font-semibold text-sm">Text Colors</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="text-color">Text Color</Label>
                        <div className="flex gap-2">
                          <Input
                            id="text-color"
                            type="color"
                            value={textColor}
                            onChange={(e) => setTextColor(e.target.value)}
                            className="w-20 h-10"
                          />
                          <Input
                            type="text"
                            value={textColor}
                            onChange={(e) => setTextColor(e.target.value)}
                            className="flex-1"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="text-muted-color">Muted Text Color</Label>
                        <div className="flex gap-2">
                          <Input
                            id="text-muted-color"
                            type="color"
                            value={textMutedColor}
                            onChange={(e) => setTextMutedColor(e.target.value)}
                            className="w-20 h-10"
                          />
                          <Input
                            type="text"
                            value={textMutedColor}
                            onChange={(e) => setTextMutedColor(e.target.value)}
                            className="flex-1"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Fonts Tab */}
              <TabsContent value="fonts" className="space-y-6 mt-6">
                {/* Font Presets */}
                <div>
                  <Label className="mb-3 block">Quick Font Presets</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {fontPresets.map((preset) => (
                      <Button
                        key={preset.name}
                        variant="outline"
                        size="sm"
                        onClick={() => applyFontPreset(preset)}
                        className="justify-start"
                      >
                        <Type className="h-4 w-4 mr-2" />
                        <span className="text-xs">{preset.name}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Font Inputs */}
                <Card>
                  <CardContent className="p-4 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="heading-font">Heading Font</Label>
                      <Input
                        id="heading-font"
                        value={headingFont}
                        onChange={(e) => setHeadingFont(e.target.value)}
                        placeholder="Inter, system-ui, sans-serif"
                      />
                      <p className="text-xs text-gray-500">
                        Example: &quot;Poppins, sans-serif&quot; or &quot;Playfair Display,
                        serif&quot;
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="body-font">Body Font</Label>
                      <Input
                        id="body-font"
                        value={bodyFont}
                        onChange={(e) => setBodyFont(e.target.value)}
                        placeholder="Inter, system-ui, sans-serif"
                      />
                      <p className="text-xs text-gray-500">
                        Example: &quot;Open Sans, sans-serif&quot; or &quot;Lato, sans-serif&quot;
                      </p>
                    </div>

                    {/* Font Preview */}
                    <div className="mt-6 p-4 border rounded-lg space-y-3">
                      <h4 className="text-xs font-semibold text-gray-500">Preview</h4>
                      <h2
                        className="text-2xl font-bold"
                        style={{ fontFamily: headingFont, color: primaryColor }}
                      >
                        Heading Font Preview
                      </h2>
                      <p style={{ fontFamily: bodyFont, color: textColor }}>
                        This is how your body text will look. The quick brown fox jumps over the
                        lazy dog.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Styling Tab */}
              <TabsContent value="styling" className="space-y-6 mt-6">
                <Card>
                  <CardContent className="p-4 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="border-radius">Border Radius</Label>
                      <div className="flex gap-2">
                        <Input
                          id="border-radius"
                          value={borderRadius}
                          onChange={(e) => setBorderRadius(e.target.value)}
                          placeholder="0.5rem"
                          className="flex-1"
                        />
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setBorderRadius("0rem")}
                          >
                            None
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setBorderRadius("0.25rem")}
                          >
                            Small
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setBorderRadius("0.5rem")}
                          >
                            Medium
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setBorderRadius("1rem")}
                          >
                            Large
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Shadow Style</Label>
                      <div className="grid grid-cols-3 gap-2">
                        {(["none", "sm", "md", "lg", "xl", "modern"] as const).map((shadow) => (
                          <Button
                            key={shadow}
                            variant={shadows === shadow ? "default" : "outline"}
                            size="sm"
                            onClick={() => setShadows(shadow)}
                          >
                            {shadow}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Live Preview Card */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-4">Live Preview</h3>
                    <div
                      className="p-6 rounded-lg space-y-4"
                      style={{
                        backgroundColor: surfaceColor,
                        borderRadius,
                      }}
                    >
                      <h2
                        className="text-2xl font-bold"
                        style={{ fontFamily: headingFont, color: textColor }}
                      >
                        Your Theme Preview
                      </h2>
                      <p style={{ fontFamily: bodyFont, color: textMutedColor }}>
                        This is a preview of how your theme will look. You can see the colors,
                        fonts, and styling applied.
                      </p>
                      <div className="flex gap-2">
                        <button
                          className="px-4 py-2 rounded font-medium"
                          style={{
                            backgroundColor: primaryColor,
                            color: "#ffffff",
                            borderRadius,
                          }}
                        >
                          Primary Button
                        </button>
                        <button
                          className="px-4 py-2 rounded font-medium border-2"
                          style={{
                            borderColor: secondaryColor,
                            color: secondaryColor,
                            borderRadius,
                          }}
                        >
                          Secondary Button
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>

        {/* Action Buttons — switch per active tab, since Presets/Custom end in different actions */}
        <div className="flex justify-end gap-3 pt-4 border-t flex-shrink-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          {activeTab === "presets" ? (
            <Button
              onClick={handleApplyTheme}
              disabled={selectedThemeId === currentThemeId}
              className="min-w-[120px]"
            >
              {selectedThemeId === currentThemeId ? "Already Applied" : "Apply Theme"}
            </Button>
          ) : (
            <Button onClick={handleSaveCustom}>
              <Save className="h-4 w-4 mr-2" />
              Save Theme
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
