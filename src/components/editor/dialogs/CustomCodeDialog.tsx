"use client";

import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { validateCustomCode } from "@/lib/validate-custom-code";

interface CustomCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  code?: string;
  onSave: (code: string) => void;
}

/** File > Code — paste a raw HTML/script snippet (analytics, chat widget,
 * etc.) inserted as-is near the top of the published page. */
export default function CustomCodeDialog({
  open,
  onOpenChange,
  code,
  onSave,
}: CustomCodeDialogProps) {
  const [value, setValue] = useState(code || "");
  const [error, setError] = useState<string | null>(null);

  // This stays mounted across opens (only `open` toggles), so re-sync from
  // the current page's code each time it's opened rather than once at mount.
  useEffect(() => {
    if (open) {
      setValue(code || "");
      setError(null);
    }
  }, [open, code]);

  const handleSave = () => {
    const validationError = validateCustomCode(value);
    if (validationError) {
      setError(validationError);
      return;
    }
    onSave(value.trim());
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-xl flex flex-col">
        <SheetHeader className="flex-shrink-0">
          <SheetTitle>Custom Code</SheetTitle>
          <SheetDescription>
            Analytics, chat widgets, tracking scripts — inserted as-is near the top of the published
            page.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto min-h-0 px-1 py-4 space-y-2">
          <Label htmlFor="customCode">HTML / Script</Label>
          <Textarea
            id="customCode"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setError(null);
            }}
            placeholder="<!-- Google Analytics, Facebook Pixel, chat widget, ... -->"
            rows={16}
            className="font-mono text-xs"
          />
          {error && <p className="text-xs text-red-600">{error}</p>}
          <p className="text-xs text-gray-500">Only paste code from sources you trust.</p>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t flex-shrink-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
