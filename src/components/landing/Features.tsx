"use client";

import { motion } from "framer-motion";
import { Theme, FeaturesConfig } from "@/types/landing";
import { getBackgroundStyle, isBackgroundDark } from "@/lib/background-utils";
import { SmartImage } from "@/components/ui/smart-image";
import { getLayoutClasses } from "@/lib/layout-utils";
import { useStaggerAnimation } from "@/hooks/use-scroll-animation";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface FeaturesProps {
  config: FeaturesConfig;
  theme?: Theme;
}

export function Features({ config }: FeaturesProps) {
  const {
    title,
    subtitle,
    description,
    features,
    columns = 3,
    background,
    spacing,
    containerWidth,
    animation,
  } = config;

  // Use stagger animation for the features grid
  const stagger = useStaggerAnimation({
    animation: animation || { type: "fadeInUp", duration: 600 },
    staggerDelay: 0.1,
  });

  // Use CSS variables for theme colors
  const primaryColor = "var(--color-primary)";
  const textColor = "var(--color-text)";
  const textMuted = "var(--color-text-muted)";
  const surfaceColor = "var(--color-surface)";
  const bgColor = "var(--color-background)";
  const headingFont = "var(--font-heading)";
  const bodyFont = "var(--font-body)";

  // Check if background is dark
  const isDarkBg = isBackgroundDark(background);

  // Layout classes
  const layout = getLayoutClasses({ spacing, containerWidth, columns });

  return (
    <section
      id="features"
      className={`${layout.section}`}
      style={getBackgroundStyle(background, bgColor)}
    >
      <div className={layout.container}>
        {/* Header */}
        <div className="text-center mb-12 max-w-2xl mx-auto">
          {subtitle && (
            <div
              className="text-xs font-semibold uppercase tracking-wide mb-3"
              style={{ color: isDarkBg ? "rgba(255,255,255,0.8)" : primaryColor }}
            >
              {subtitle}
            </div>
          )}

          <h2
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{ color: isDarkBg ? "#ffffff" : textColor, fontFamily: headingFont }}
          >
            {title}
          </h2>

          {description && (
            <p
              className="text-base md:text-lg"
              style={{
                color: isDarkBg ? "rgba(255,255,255,0.85)" : textMuted,
                fontFamily: bodyFont,
              }}
            >
              {description}
            </p>
          )}
        </div>

        {/* Features - Grid or Carousel Layout */}
        {config.layout === "carousel" ? (
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full max-w-5xl mx-auto"
          >
            <CarouselContent>
              {features.map((feature, index) => (
                <CarouselItem
                  key={feature.id || `feature-${index}`}
                  className="md:basis-1/2 lg:basis-1/3"
                >
                  <div className="p-1 h-full">
                    <div
                      className="group relative bg-white dark:bg-gray-800 rounded-xl p-6 hover:shadow-lg transition-all duration-300 h-full"
                      style={{
                        backgroundColor: isDarkBg ? "rgba(255,255,255,0.08)" : surfaceColor,
                        border: isDarkBg ? "1px solid rgba(255,255,255,0.1)" : "1px solid #e5e7eb",
                      }}
                    >
                      {/* Feature Image */}
                      {feature.image && (
                        <div className="relative mb-5 -mx-6 -mt-6 h-40 overflow-hidden rounded-t-xl">
                          <SmartImage
                            src={feature.image}
                            alt={feature.title}
                            fill
                            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}

                      {/* Icon */}
                      {feature.icon && (
                        <div className="text-4xl mb-4 inline-block">{feature.icon}</div>
                      )}

                      {/* Title */}
                      <h3
                        className="text-lg md:text-xl font-semibold mb-2"
                        style={{ color: isDarkBg ? "#ffffff" : textColor, fontFamily: headingFont }}
                      >
                        {feature.title}
                      </h3>

                      {/* Description */}
                      <p
                        className="text-sm md:text-base leading-relaxed"
                        style={{
                          color: isDarkBg ? "rgba(255,255,255,0.75)" : textMuted,
                          fontFamily: bodyFont,
                        }}
                      >
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex" />
            <CarouselNext className="hidden md:flex" />
          </Carousel>
        ) : (
          <motion.div
            ref={stagger.ref}
            initial="hidden"
            animate={stagger.animate}
            variants={stagger.containerVariants}
            className={`grid ${layout.grid} gap-6`}
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.id || `feature-${index}`}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: {
                      duration: 0.6,
                      ease: "easeOut",
                    },
                  },
                }}
                className="group relative bg-white dark:bg-gray-800 rounded-xl p-6 hover:shadow-lg transition-all duration-300"
                style={{
                  backgroundColor: isDarkBg ? "rgba(255,255,255,0.08)" : surfaceColor,
                  border: isDarkBg ? "1px solid rgba(255,255,255,0.1)" : "1px solid #e5e7eb",
                }}
              >
                {/* Feature Image */}
                {feature.image && (
                  <div className="relative mb-5 -mx-6 -mt-6 h-40 overflow-hidden rounded-t-xl">
                    <SmartImage
                      src={feature.image}
                      alt={feature.title}
                      fill
                      sizes="(min-width: 768px) 50vw, 100vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}

                {/* Icon */}
                {feature.icon && <div className="text-4xl mb-4 inline-block">{feature.icon}</div>}

                {/* Title */}
                <h3
                  className="text-lg md:text-xl font-semibold mb-2"
                  style={{ color: isDarkBg ? "#ffffff" : textColor, fontFamily: headingFont }}
                >
                  {feature.title}
                </h3>

                {/* Description */}
                <p
                  className="text-sm md:text-base leading-relaxed"
                  style={{
                    color: isDarkBg ? "rgba(255,255,255,0.75)" : textMuted,
                    fontFamily: bodyFont,
                  }}
                >
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}
