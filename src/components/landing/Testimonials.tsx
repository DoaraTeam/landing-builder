"use client";

import { motion } from "framer-motion";
import { Theme, TestimonialsConfig } from "@/types/landing";
import { Card, CardContent } from "@/components/ui/card";
import { SmartImage } from "@/components/ui/smart-image";
import { Star } from "lucide-react";
import { useStaggerAnimation } from "@/hooks/use-scroll-animation";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface TestimonialsProps {
  config: TestimonialsConfig;
  theme?: Theme;
}

export function Testimonials({ config }: TestimonialsProps) {
  const { title, subtitle, description, testimonials, background, spacing, animation, layout } =
    config;

  const stagger = useStaggerAnimation({
    animation: animation || { type: "fadeInUp", duration: 700, delay: 100 },
    staggerDelay: 0.12,
  });

  // Use CSS variables for theme colors
  const primaryColor = "var(--color-primary)";
  const textColor = "var(--color-text)";
  const textMuted = "var(--color-text-muted)";
  const surfaceColor = "var(--color-surface)";
  const bgColor = "var(--color-background)";

  const getBackgroundColor = () => {
    if (background.type === "solid") {
      if (background.color === "background") return bgColor;
      if (background.color === "surface") return surfaceColor;
      return background.color;
    }
    return bgColor;
  };

  const paddingClass = spacing?.padding === "xl" ? "py-20" : "py-16";

  const renderTestimonialCard = (testimonial: TestimonialsConfig["testimonials"][0]) => (
    <Card className="border-none shadow-sm h-full" style={{ backgroundColor: surfaceColor }}>
      <CardContent className="p-6">
        {testimonial.rating && (
          <div className="flex gap-1 mb-4">
            {Array.from({ length: testimonial.rating }).map((_, i) => (
              <Star
                key={`star-${testimonial.id}-${i}`}
                className="h-5 w-5 fill-current"
                style={{ color: primaryColor }}
              />
            ))}
          </div>
        )}

        <p className="text-base mb-6 italic" style={{ color: textColor }}>
          &quot;{testimonial.content || testimonial.text}&quot;
        </p>

        <div className="flex items-center gap-3">
          {testimonial.avatar && (
            <SmartImage
              src={testimonial.avatar}
              alt={testimonial.name || testimonial.author || ""}
              width={48}
              height={48}
              className="w-12 h-12 rounded-full object-cover"
            />
          )}

          <div>
            <div className="font-semibold" style={{ color: textColor }}>
              {testimonial.name || testimonial.author}
            </div>
            {(testimonial.role || testimonial.company) && (
              <div className="text-sm" style={{ color: textMuted }}>
                {testimonial.role}
                {testimonial.role && testimonial.company && ", "}
                {testimonial.company}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <section className={`${paddingClass} px-4`} style={{ backgroundColor: getBackgroundColor() }}>
      <div className="container mx-auto">
        <div className="text-center mb-12 max-w-3xl mx-auto">
          {subtitle && (
            <div
              className="text-sm font-semibold uppercase tracking-wider mb-4"
              style={{ color: primaryColor }}
            >
              {subtitle}
            </div>
          )}

          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: textColor }}>
            {title}
          </h2>

          {description && (
            <p className="text-lg" style={{ color: textMuted }}>
              {description}
            </p>
          )}
        </div>

        {/* Testimonials - Grid or Carousel Layout */}
        {layout === "carousel" ? (
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full max-w-6xl mx-auto"
          >
            <CarouselContent>
              {testimonials?.map((testimonial, index) => (
                <CarouselItem
                  key={testimonial.id || `testimonial-${index}`}
                  className="md:basis-1/2 lg:basis-1/3"
                >
                  <div className="p-1 h-full">{renderTestimonialCard(testimonial)}</div>
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
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {testimonials?.map((testimonial, index) => (
              <motion.div
                key={testimonial.id || `testimonial-${index}`}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: {
                      duration: 0.7,
                      ease: "easeOut",
                    },
                  },
                }}
              >
                {renderTestimonialCard(testimonial)}
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}
