import { Metadata } from "next";
import { Suspense } from "react";
import { PreviewClient } from "@/components/preview/PreviewClient";

export const metadata: Metadata = {
  title: "Preview - Landing Page",
  description: "Preview your landing page before publishing",
};

export default function PreviewPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-gray-400">
          Loading preview...
        </div>
      }
    >
      <PreviewClient />
    </Suspense>
  );
}
