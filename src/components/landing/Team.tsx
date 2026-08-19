"use client";

import { Theme, AnimationConfig } from "@/types/landing";
import { Card, CardContent } from "@/components/ui/card";
import { SmartImage } from "@/components/ui/smart-image";
import { motion } from "framer-motion";
import { useStaggerAnimation } from "@/hooks/use-scroll-animation";
import { ensureAnimation } from "@/lib/animation-defaults";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio?: string;
  image: string;
  social?: {
    linkedin?: string;
    twitter?: string;
    github?: string;
  };
}

interface TeamConfig {
  title: string;
  subtitle?: string;
  description?: string;
  members: TeamMember[];
  layout?: "grid" | "carousel";
  columns?: 2 | 3 | 4;
  background: {
    type: "solid";
    color?: string;
  };
  spacing?: {
    padding?: "md" | "lg" | "xl";
  };
  animation?: AnimationConfig;
}

interface TeamProps {
  config: TeamConfig;
  theme?: Theme;
}

export function Team({ config, theme }: TeamProps) {
  const configWithAnimation = ensureAnimation(config, "team");
  const {
    title,
    subtitle,
    description,
    members,
    columns = 3,
    background,
    spacing,
  } = configWithAnimation;

  const stagger = useStaggerAnimation({
    animation: configWithAnimation.animation,
    staggerDelay: 0.15,
  });

  const primaryColor = "var(--color-primary)";
  const textColor = "var(--color-text)";
  const textMuted = "var(--color-text-muted)";
  const surfaceColor = "var(--color-surface)";
  const headingFont = "var(--font-heading)";
  const bodyFont = "var(--font-body)";

  const getBackgroundColor = () => {
    if (background.color === "background") return "var(--color-background)";
    if (background.color === "surface") return surfaceColor;
    return background.color || "#ffffff";
  };

  const gridColsClass = {
    2: "md:grid-cols-2",
    3: "md:grid-cols-2 lg:grid-cols-3",
    4: "md:grid-cols-2 lg:grid-cols-4",
  };

  const paddingClass = spacing?.padding === "xl" ? "py-20" : "py-16";

  return (
    <section className={`${paddingClass} px-4`} style={{ backgroundColor: getBackgroundColor() }}>
      <div className="container mx-auto">
        {/* Header */}
        <div className="text-center mb-12 max-w-3xl mx-auto">
          {subtitle && (
            <div
              className="text-sm font-semibold uppercase tracking-wider mb-4"
              style={{ color: primaryColor }}
            >
              {subtitle}
            </div>
          )}

          <h2
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{ color: textColor, fontFamily: headingFont }}
          >
            {title}
          </h2>

          {description && (
            <p className="text-lg" style={{ color: textMuted, fontFamily: bodyFont }}>
              {description}
            </p>
          )}
        </div>

        {/* Team Grid */}
        <motion.div
          className={`grid grid-cols-1 ${gridColsClass[columns]} gap-8`}
          variants={stagger.containerVariants}
          initial="hidden"
          animate={stagger.animate}
          ref={stagger.ref}
        >
          {members.map((member, index) => (
            <motion.div key={member.id || `member-${index}`} variants={stagger.itemVariants}>
              <Card className="border-none shadow-sm hover:shadow-lg transition-shadow overflow-hidden">
                <CardContent className="p-0">
                  {/* Member Image */}
                  <div className="relative overflow-hidden aspect-square">
                    <SmartImage
                      src={member.image}
                      alt={member.name}
                      fill
                      sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition-transform duration-300 hover:scale-110"
                    />
                  </div>

                  {/* Member Info */}
                  <div className="p-6 text-center">
                    <h3
                      className="text-xl font-semibold mb-1"
                      style={{ color: textColor, fontFamily: headingFont }}
                    >
                      {member.name}
                    </h3>
                    <p
                      className="text-sm font-medium mb-3"
                      style={{ color: primaryColor, fontFamily: bodyFont }}
                    >
                      {member.role}
                    </p>
                    {member.bio && (
                      <p
                        className="text-sm mb-4"
                        style={{ color: textMuted, fontFamily: bodyFont }}
                      >
                        {member.bio}
                      </p>
                    )}

                    {/* Social Links */}
                    {member.social && (
                      <div className="flex justify-center gap-4">
                        {member.social.linkedin && (
                          <a
                            href={member.social.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:opacity-70 transition-opacity"
                            style={{ color: textMuted }}
                          >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                            </svg>
                          </a>
                        )}
                        {member.social.twitter && (
                          <a
                            href={member.social.twitter}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:opacity-70 transition-opacity"
                            style={{ color: textMuted }}
                          >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
                            </svg>
                          </a>
                        )}
                        {member.social.github && (
                          <a
                            href={member.social.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:opacity-70 transition-opacity"
                            style={{ color: textMuted }}
                          >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                            </svg>
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
