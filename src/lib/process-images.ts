import { ComponentConfig, LandingPage } from "@/types/landing";

// Converts any temporary base64 images embedded in a page's component tree
// into permanent files under public/assets/images/ (via POST /api/save-images)
// before the page is persisted — otherwise raw base64 data would get written
// straight into landing-config.json. Extracted verbatim from
// EditableLandingPage.tsx.
export async function processImages(pageData: LandingPage): Promise<LandingPage> {
  const imagesToSave: Array<{ url: string; filename?: string }> = [];

  // Quick check - only scan if we might have base64 images
  const pageJsonString = JSON.stringify(pageData.components);
  if (!pageJsonString.includes("data:image/")) {
    // No base64 images found, return immediately
    return pageData;
  }

  // Collect all base64 images from components
  const collectImages = (obj: unknown) => {
    if (typeof obj === "string" && obj.startsWith("data:image/")) {
      imagesToSave.push({ url: obj });
    } else if (typeof obj === "object" && obj !== null) {
      Object.values(obj).forEach(collectImages);
    }
  };

  pageData.components.forEach((component) => collectImages(component.config));

  // If no images to process, return as is
  if (imagesToSave.length === 0) {
    return pageData;
  }

  try {
    // Save images to permanent files with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch("/api/save-images", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ images: imagesToSave }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Image save failed: ${response.status} ${response.statusText}`);
    }

    const { savedImages } = await response.json();

    // Replace base64 URLs with permanent URLs
    const replaceImages = (obj: unknown): unknown => {
      if (typeof obj === "string") {
        const replacement = savedImages.find(
          (img: { originalUrl: string; newUrl: string }) => img.originalUrl === obj
        );
        return replacement ? replacement.newUrl : obj;
      }
      if (Array.isArray(obj)) {
        return obj.map(replaceImages);
      }
      if (typeof obj === "object" && obj !== null) {
        const result: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(obj)) {
          result[key] = replaceImages(value);
        }
        return result;
      }
      return obj;
    };

    const processedComponents = pageData.components.map((component) => ({
      ...component,
      config: replaceImages(component.config),
    }));

    return {
      ...pageData,
      components: processedComponents as ComponentConfig[],
    };
  } catch (error) {
    console.warn("Image processing failed, saving without image conversion:", error);
    // Return original data if image processing fails
    return pageData;
  }
}
