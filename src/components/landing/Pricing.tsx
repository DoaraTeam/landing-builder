"use client";

import { motion } from "framer-motion";
import { Theme, PricingConfig } from "@/types/landing";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { getLayoutClasses } from "@/lib/layout-utils";
import { getBackgroundStyle } from "@/lib/background-utils";
import { useStaggerAnimation } from "@/hooks/use-scroll-animation";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface PricingProps {
  config: PricingConfig;
  theme?: Theme;
}

export function Pricing({ config }: PricingProps) {
  const { title, subtitle, description, plans, background, spacing, containerWidth, animation } =
    config;

  const stagger = useStaggerAnimation({
    animation: animation || { type: "fadeInUp", duration: 700, delay: 100 },
    staggerDelay: 0.15,
  });

  // Use CSS variables for theme colors
  const primaryColor = "var(--color-primary)";
  const textColor = "var(--color-text)";
  const textMuted = "var(--color-text-muted)";
  const bgColor = "var(--color-background)";

  const layout = getLayoutClasses({ spacing, containerWidth });

  return (
    <section className={`${layout.section}`} style={getBackgroundStyle(background, bgColor)}>
      <div className={layout.container}>
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

        {/* Pricing - Grid or Carousel Layout */}
        {config.layout === "carousel" ? (
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full max-w-6xl mx-auto"
          >
            <CarouselContent>
              {plans.map((plan, index) => (
                <CarouselItem
                  key={plan.id || `plan-${index}`}
                  className="md:basis-1/2 lg:basis-1/3"
                >
                  <div className="p-1 h-full pt-6">
                    <Card
                      className={`relative h-full overflow-visible`}
                      style={{
                        borderColor: plan.highlighted ? primaryColor : undefined,
                        backgroundColor: bgColor,
                      }}
                    >
                      {plan.highlighted && (
                        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                          <Badge style={{ backgroundColor: primaryColor, color: "#ffffff" }}>
                            {plan.badge || "Most Popular"}
                          </Badge>
                        </div>
                      )}

                      <CardHeader
                        className={`text-center pb-8 ${plan.highlighted ? "pt-10" : "pt-8"}`}
                      >
                        <h3 className="text-2xl font-bold mb-2" style={{ color: textColor }}>
                          {plan.name}
                        </h3>
                        <p className="text-sm mb-4" style={{ color: textMuted }}>
                          {plan.description}
                        </p>
                        <div className="flex items-baseline justify-center gap-1">
                          <span className="text-4xl font-bold" style={{ color: textColor }}>
                            {plan.price}
                          </span>
                          {plan.period && <span style={{ color: textMuted }}>{plan.period}</span>}
                        </div>
                      </CardHeader>

                      <CardContent>
                        <ul className="space-y-3">
                          {plan.features.map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <Check
                                className="h-5 w-5 shrink-0 mt-0.5"
                                style={{ color: primaryColor }}
                              />
                              <span style={{ color: textColor }}>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>

                      <CardFooter>
                        <Button
                          asChild
                          className="w-full"
                          variant={plan.highlighted ? "default" : "outline"}
                          style={
                            plan.highlighted
                              ? { backgroundColor: primaryColor, color: "#ffffff" }
                              : { borderColor: primaryColor, color: primaryColor }
                          }
                        >
                          <a href={plan.cta?.link || "#"}>{plan.cta?.text || "Get Started"}</a>
                        </Button>
                      </CardFooter>
                    </Card>
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
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto pt-6"
          >
            {plans.map((plan, index) => (
              <motion.div
                key={plan.id || `plan-${index}`}
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
                <Card
                  className={`relative overflow-visible ${plan.highlighted ? "border-2 shadow-lg scale-105" : "border shadow-sm"}`}
                  style={{
                    borderColor: plan.highlighted ? primaryColor : undefined,
                    backgroundColor: bgColor,
                  }}
                >
                  {plan.highlighted && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                      <Badge style={{ backgroundColor: primaryColor, color: "#ffffff" }}>
                        {plan.badge || "Most Popular"}
                      </Badge>
                    </div>
                  )}

                  <CardHeader className={`text-center pb-8 ${plan.highlighted ? "pt-10" : "pt-8"}`}>
                    <h3 className="text-2xl font-bold mb-2" style={{ color: textColor }}>
                      {plan.name}
                    </h3>
                    <p className="text-sm mb-4" style={{ color: textMuted }}>
                      {plan.description}
                    </p>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-4xl font-bold" style={{ color: textColor }}>
                        {plan.price}
                      </span>
                      {plan.period && <span style={{ color: textMuted }}>{plan.period}</span>}
                    </div>
                  </CardHeader>

                  <CardContent>
                    <ul className="space-y-3">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check
                            className="h-5 w-5 shrink-0 mt-0.5"
                            style={{ color: primaryColor }}
                          />
                          <span style={{ color: textColor }}>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>

                  <CardFooter>
                    <Button
                      asChild
                      className="w-full"
                      variant={plan.highlighted ? "default" : "outline"}
                      style={
                        plan.highlighted
                          ? { backgroundColor: primaryColor, color: "#ffffff" }
                          : { borderColor: primaryColor, color: primaryColor }
                      }
                    >
                      <a href={plan.cta?.link || "#"}>{plan.cta?.text || "Get Started"}</a>
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}
