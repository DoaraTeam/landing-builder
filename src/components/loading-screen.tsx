import { LayoutTemplate } from "lucide-react";

/**
 * Shared full-screen loading state — same logo mark used in the header/footer,
 * plus a simple bouncing-dots indicator. Reuse this wherever a page needs a
 * loading placeholder instead of ad-hoc "Loading..." text.
 */
export function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <span className="flex h-10 w-10 animate-pulse items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <LayoutTemplate className="h-5 w-5" />
        </span>

        <span className="text-sm font-medium text-muted-foreground">Landing Page Builder</span>

        <span className="flex gap-1.5">
          <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" />
        </span>
      </div>
    </div>
  );
}
