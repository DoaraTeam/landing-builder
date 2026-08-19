import { Metadata } from "next";
import { BuilderIntro } from "@/components/builder-intro";

export const metadata: Metadata = {
  title: "Landing Page Builder",
  description:
    "A visual drag-and-drop tool for building and publishing landing pages, no code required.",
};

export default function Home() {
  return <BuilderIntro />;
}
