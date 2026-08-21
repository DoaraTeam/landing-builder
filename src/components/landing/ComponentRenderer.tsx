"use client";

import { ComponentConfig, Theme } from "@/types/landing";
import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { Pricing } from "@/components/landing/Pricing";
import { Testimonials } from "@/components/landing/Testimonials";
import { CTA } from "@/components/landing/CTA";
import { Footer } from "@/components/landing/Footer";
import { Stats } from "@/components/landing/Stats";
import { Team } from "@/components/landing/Team";
import { FAQ } from "@/components/landing/FAQ";
import { Gallery } from "@/components/landing/Gallery";
import { LogoCloud } from "@/components/landing/LogoCloud";
import { Contact } from "@/components/landing/Contact";
import { Content } from "@/components/landing/Content";
import { Newsletter } from "@/components/landing/Newsletter";
import { Video } from "@/components/landing/Video";

interface ComponentRendererProps {
  component: ComponentConfig;
  theme?: Theme;
}

/**
 * ComponentRenderer - Routes component types to their implementations
 * This is the main router for rendering landing page components
 */
export function ComponentRenderer({ component, theme }: ComponentRendererProps) {
  const { id, type, config, visible } = component;

  // Don't render invisible components in public view
  if (visible === false) {
    return null;
  }

  // Wrap each component in a div with ID for scroll navigation. The header
  // is included too — it's never offered as a target in the public nav tabs
  // (syncHeaderTabs excludes it there), but the editor's PageTree section
  // list lists every component including the header, and needs a real
  // scroll-to-here target for it just like everything else. A plain
  // non-positioned wrapper doesn't interfere with the header's own
  // sticky/fixed positioning.
  const wrapWithId = (children: React.ReactNode) => (
    <div id={id} className="scroll-mt-20">
      {children}
    </div>
  );

  let componentElement: React.ReactNode;

  switch (type) {
    case "header":
      componentElement = <Header config={config as never} theme={theme} />;
      break;

    case "hero":
      componentElement = <Hero config={config as never} theme={theme} />;
      break;

    case "features":
      componentElement = <Features config={config as never} theme={theme} />;
      break;

    case "pricing":
      componentElement = <Pricing config={config as never} theme={theme} />;
      break;

    case "testimonials":
      componentElement = <Testimonials config={config as never} theme={theme} />;
      break;

    case "cta":
      componentElement = <CTA config={config as never} theme={theme} />;
      break;

    case "footer":
      componentElement = <Footer config={config as never} theme={theme} />;
      break;

    case "stats":
      componentElement = <Stats config={config as never} theme={theme} />;
      break;

    case "team":
      componentElement = <Team config={config as never} theme={theme} />;
      break;

    case "faq":
      componentElement = <FAQ config={config as never} theme={theme} />;
      break;

    case "gallery":
      componentElement = <Gallery config={config as never} theme={theme} />;
      break;

    case "logo-cloud":
      componentElement = <LogoCloud config={config as never} theme={theme} />;
      break;

    case "contact":
      componentElement = <Contact config={config as never} theme={theme} />;
      break;

    case "content":
      componentElement = <Content config={config as never} theme={theme} />;
      break;

    case "newsletter":
      componentElement = <Newsletter config={config as never} theme={theme} />;
      break;

    case "video":
      componentElement = <Video config={config as never} theme={theme} />;
      break;

    default:
      console.warn(`Unknown component type: ${type}`);
      componentElement = (
        <div className="py-20 px-4 text-center bg-red-50">
          <p className="text-red-500">Unknown component type: {type}</p>
        </div>
      );
  }

  return wrapWithId(componentElement);
}
