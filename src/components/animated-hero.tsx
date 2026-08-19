"use client";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MoveRight, PhoneCall } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const STATS = ["16 Components", "15 Themes", "Auto-Save", "SEO Ready"];

function Hero() {
  const [titleNumber, setTitleNumber] = useState(0);
  const titles = useMemo(() => ["dynamic", "powerful", "customizable", "intuitive", "fast"], []);
  const router = useRouter();

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setTitleNumber((prev) => (prev + 1) % titles.length);
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [titleNumber, titles]);

  return (
    <div className="relative w-full overflow-hidden">
      <div className="container relative mx-auto">
        <div className="flex gap-8 py-24 lg:py-40 items-center justify-center flex-col">
          <div className="flex gap-4 flex-col">
            <h1 className="text-5xl md:text-7xl max-w-2xl tracking-tighter text-center font-regular">
              <span>Build your</span>
              <span className="relative flex w-full justify-center overflow-hidden text-center md:pb-4 md:pt-1">
                &nbsp;
                {titles.map((title, index) => (
                  <motion.span
                    key={index}
                    className="absolute font-semibold"
                    initial={{ opacity: 0, y: "-100" }}
                    transition={{ type: "spring", stiffness: 50 }}
                    animate={
                      titleNumber === index
                        ? { y: 0, opacity: 1 }
                        : { y: titleNumber > index ? -150 : 150, opacity: 0 }
                    }
                  >
                    {title}
                  </motion.span>
                ))}
              </span>
              <br />
              landing pages with ease
            </h1>

            <p className="text-lg md:text-xl leading-relaxed tracking-tight text-muted-foreground max-w-2xl text-center">
              Our CMS empowers you to create, customize, and launch dynamic landing pages
              effortlessly—no coding required. Update content, tweak layouts, and publish changes in
              real time with our drag-and-drop interface.
            </p>
          </div>

          <div className="flex flex-row gap-3">
            <Button size="lg" className="gap-4" variant="outline">
              Book a demo <PhoneCall className="w-4 h-4" />
            </Button>
            <Button size="lg" className="gap-4" onClick={() => router.push("/editor")}>
              Start building <MoveRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-4 text-sm text-muted-foreground">
            {STATS.map((stat) => (
              <span key={stat} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-foreground/40" />
                {stat}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export { Hero };
