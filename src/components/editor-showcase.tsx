"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { BrowserFrame } from "@/components/browser-frame";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};

// Events that could trigger an edit, drag, or navigation inside the real editor.
const BLOCKED_EVENTS = ["click", "mousedown", "pointerdown", "dragstart", "submit", "keydown"];

export function EditorShowcase() {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Scrolling is left fully native (no pointer-events-none, no manual scroll
  // forwarding) so it's as smooth as scrolling any other page — forwarding
  // wheel events by hand through window.scrollBy() was noticeably slower and
  // janky against the real editor's own re-renders. Instead, clicks/drags are
  // neutralized at the source: a capture-phase listener inside the iframe's
  // own document stops them before the editor's UI ever sees them.
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleLoad = () => {
      const doc = iframe.contentDocument;
      if (!doc) return;

      const blockInteraction = (event: Event) => {
        event.preventDefault();
        event.stopPropagation();
      };

      BLOCKED_EVENTS.forEach((type) => doc.addEventListener(type, blockInteraction, true));
    };

    iframe.addEventListener("load", handleLoad);
    return () => iframe.removeEventListener("load", handleLoad);
  }, []);

  return (
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
            See the editor in action
          </h2>
          <p className="text-muted-foreground mt-3">
            This is the real editor, previewed live — not a mockup.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={fadeUp}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="hidden md:block"
        >
          <BrowserFrame url="yoursite.com/editor">
            <div className="relative h-[70vh] max-h-[720px] w-full overflow-hidden bg-muted/20">
              <iframe
                ref={iframeRef}
                src="/editor"
                title="Landing page editor preview"
                className="absolute left-0 top-0 origin-top-left border-0"
                style={{ width: "142.86%", height: "142.86%", transform: "scale(0.7)" }}
                loading="lazy"
              />
            </div>
          </BrowserFrame>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Scroll to look around — clicking is disabled in this preview.
          </p>
        </motion.div>

        {/* Small screens: skip the scaled iframe, it doesn't fit usefully */}
        <div className="md:hidden rounded-xl border bg-muted/30 p-8 text-center text-sm text-muted-foreground">
          Open the editor on a larger screen to see it live.
        </div>
      </div>
    </section>
  );
}
