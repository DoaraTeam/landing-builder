"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutTemplate,
  MousePointerClick,
  Palette,
  Search,
  Smartphone,
  Save,
  PanelTop,
  LayoutGrid,
  Tag,
  MessageSquareQuote,
  Megaphone,
  PanelBottom,
  BarChart3,
  Users,
  HelpCircle,
  Image as ImageIcon,
  Building2,
  Mail,
  FileText,
  Send,
  Video,
  MoveRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Hero } from "@/components/animated-hero";
import { BuilderHeader } from "@/components/builder-header";
import { EditorShowcase } from "@/components/editor-showcase";
import { TemplateShowcase } from "@/components/template-showcase";
import { getThemesArray } from "@/lib/themes";

const CORE_FEATURES = [
  {
    icon: MousePointerClick,
    title: "Drag & Drop Editor",
    description: "Reorder, add, or remove sections visually — no code required.",
  },
  {
    icon: Palette,
    title: "Themes & Custom Colors",
    description: "Switch between professionally designed themes or create your own.",
  },
  {
    icon: LayoutTemplate,
    title: "Multi-Page Support",
    description: "Build a landing page with linked sub-pages and built-in navigation.",
  },
  {
    icon: Smartphone,
    title: "Fully Responsive",
    description: "Every component looks great on mobile, tablet, and desktop.",
  },
  {
    icon: Search,
    title: "Advanced SEO",
    description: "Full control over Open Graph, Twitter Cards, robots, and more.",
  },
  {
    icon: Save,
    title: "Auto-Save & Versions",
    description: "Your work saves itself, with a full version history to roll back to.",
  },
];

const COMPONENT_LIST = [
  { icon: PanelTop, label: "Header" },
  { icon: LayoutGrid, label: "Hero" },
  { icon: LayoutGrid, label: "Features" },
  { icon: Tag, label: "Pricing" },
  { icon: MessageSquareQuote, label: "Testimonials" },
  { icon: Megaphone, label: "CTA" },
  { icon: PanelBottom, label: "Footer" },
  { icon: BarChart3, label: "Stats" },
  { icon: Users, label: "Team" },
  { icon: HelpCircle, label: "FAQ" },
  { icon: ImageIcon, label: "Gallery" },
  { icon: Building2, label: "Logo Cloud" },
  { icon: Mail, label: "Contact" },
  { icon: FileText, label: "Content" },
  { icon: Send, label: "Newsletter" },
  { icon: Video, label: "Video" },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Pick a template",
    description: "Start from a ready-made template or a blank page.",
  },
  {
    step: "02",
    title: "Edit visually",
    description: "Drag, drop, and tweak every section until it feels right.",
  },
  {
    step: "03",
    title: "Publish",
    description: "One click makes your page live — instantly.",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};

export function BuilderIntro() {
  const router = useRouter();
  const themes = getThemesArray();

  return (
    <main className="relative min-h-screen">
      {/* Very faint grid texture behind the whole page — kept low-opacity so it
          reads as texture, not visual noise, under the content sections */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgb(0 0 0 / 0.02) 1px, transparent 1px), linear-gradient(to bottom, rgb(0 0 0 / 0.02) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />

      <BuilderHeader />

      <Hero />

      <EditorShowcase />

      <section id="features" className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Everything you need to launch a page
            </h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
              A focused toolkit for building and shipping landing pages, without touching code.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {CORE_FEATURES.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-60px" }}
                variants={fadeUp}
                transition={{ duration: 0.4, delay: index * 0.06 }}
                className="group rounded-xl border bg-background p-6 transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-transform group-hover:scale-110">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold mb-1">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">How it works</h2>
          </motion.div>
          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-10">
            <div
              aria-hidden
              className="hidden md:block absolute top-6 left-[16.66%] right-[16.66%] h-px bg-border"
            />
            {HOW_IT_WORKS.map((item, index) => (
              <motion.div
                key={item.step}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-60px" }}
                variants={fadeUp}
                transition={{ duration: 0.4, delay: index * 0.12 }}
                className="relative text-center"
              >
                <div className="relative z-10 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground shadow-lg">
                  {item.step}
                </div>
                <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <TemplateShowcase />

      <section className="py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              {COMPONENT_LIST.length} ready-to-use components
            </h2>
            <p className="text-muted-foreground mt-3">
              Mix and match sections to build the exact page you need.
            </p>
          </motion.div>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-4">
            {COMPONENT_LIST.map((component) => (
              <div
                key={component.label}
                className="group flex flex-col items-center gap-2 rounded-lg border bg-background p-4 text-center transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <component.icon className="w-5 h-5 text-primary transition-transform group-hover:scale-110" />
                <span className="text-xs text-muted-foreground">{component.label}</span>
              </div>
            ))}
          </div>

          <div className="text-center mt-12 mb-6">
            <h3 className="text-xl font-semibold">{themes.length} built-in themes</h3>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-8 gap-4">
            {themes.map((theme) => (
              <div key={theme.id} className="group text-center">
                <div
                  className="h-12 w-full rounded-lg border mb-2 shadow-sm transition-transform group-hover:scale-105"
                  style={{
                    background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
                  }}
                />
                <span className="text-xs text-muted-foreground">{theme.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={fadeUp}
          transition={{ duration: 0.5 }}
          className="container mx-auto max-w-4xl"
        >
          <div className="relative overflow-hidden rounded-3xl bg-primary px-8 py-16 text-center shadow-xl">
            <h2 className="relative text-3xl md:text-4xl font-bold tracking-tight text-primary-foreground mb-4">
              Ready to build your landing page?
            </h2>
            <p className="relative text-primary-foreground/80 mb-8 max-w-xl mx-auto">
              Jump into the editor and have a page live in minutes.
            </p>
            <Button
              size="lg"
              variant="secondary"
              className="relative gap-2"
              onClick={() => router.push("/editor")}
            >
              Open the editor <MoveRight className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>
      </section>

      <footer className="border-t bg-background py-10 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div className="flex items-center gap-2 font-semibold">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <LayoutTemplate className="h-4 w-4" />
              </span>
              Landing Page Builder
            </div>

            <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <a href="#features" className="transition-colors hover:text-foreground">
                Features
              </a>
              <a href="#templates" className="transition-colors hover:text-foreground">
                Templates
              </a>
              <a href="#how-it-works" className="transition-colors hover:text-foreground">
                How it works
              </a>
              <a href="/editor" className="transition-colors hover:text-foreground">
                Editor
              </a>
            </nav>
          </div>

          <div className="mt-8 border-t pt-6 text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} Multi Landing Page Builder.
          </div>
        </div>
      </footer>
    </main>
  );
}
