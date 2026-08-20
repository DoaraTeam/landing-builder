import { readBaseLandingConfig, getPageSummaries } from "@/lib/landing-config-store";
import { PagesGrid } from "@/components/pages-dashboard/PagesGrid";

export const metadata = {
  title: "Your Pages - Landing Page Builder",
  description: "Browse and manage every landing page you've built.",
};

export default async function PagesDashboard() {
  const config = await readBaseLandingConfig();
  const pages = getPageSummaries(config);

  return <PagesGrid pages={pages} />;
}
