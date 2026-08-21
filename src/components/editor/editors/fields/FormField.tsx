"use client";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FormFieldProps {
  label: string;
  htmlFor?: string;
  small?: boolean;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}

/**
 * The `<div className="space-y-2"><Label>...</Label>{children}</div>` shape
 * repeated throughout ComponentEditor.tsx and SEOEditor.tsx — extracted once
 * both files needed it identically.
 */
export function FormField({ label, htmlFor, small, hint, className, children }: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={htmlFor} className={small ? "text-xs" : undefined}>
        {label}
      </Label>
      {children}
      {hint && <p className="text-xs text-gray-500">{hint}</p>}
    </div>
  );
}
