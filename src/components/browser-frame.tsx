import { cn } from "@/lib/utils";

interface BrowserFrameProps {
  url: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Decorative "browser window" chrome used to frame live previews
 * (the real editor, real template output) on the marketing page.
 */
export function BrowserFrame({ url, children, className }: BrowserFrameProps) {
  return (
    <div className={cn("overflow-hidden rounded-xl border bg-background shadow-xl", className)}>
      <div className="flex items-center gap-3 border-b bg-muted/50 px-4 py-2.5">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
        </div>
        <div className="mx-auto w-full max-w-xs truncate rounded-md border bg-background px-3 py-1 text-center text-xs text-muted-foreground">
          {url}
        </div>
      </div>
      {children}
    </div>
  );
}
