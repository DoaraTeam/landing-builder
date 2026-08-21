"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { InfoTooltip } from "@/components/editor/editors/fields/InfoTooltip";
import { SEOConfig } from "@/types/landing";

interface AdvancedFieldsProps {
  config: SEOConfig;
  onChange: (updates: Partial<SEOConfig>) => void;
  disabled?: boolean;
}

/** The "Nâng cao" (Advanced) tab's fields — extracted verbatim from
 * SEOEditor.tsx. */
export function AdvancedFields({ config, onChange, disabled = false }: AdvancedFieldsProps) {
  return (
    <>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="manifest">Web App Manifest</Label>
          <InfoTooltip text="Đường dẫn đến file manifest.json cho PWA." />
        </div>
        <Input
          id="manifest"
          value={config.manifest || ""}
          onChange={(e) => onChange({ manifest: e.target.value })}
          disabled={disabled}
          placeholder="/manifest.json"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="viewport">Viewport</Label>
          <InfoTooltip text="Cấu hình viewport cho thiết bị di động." />
        </div>
        <Input
          id="viewport"
          value={config.viewport || ""}
          onChange={(e) => onChange({ viewport: e.target.value })}
          disabled={disabled}
          placeholder="width=device-width, initial-scale=1"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="colorScheme">Color Scheme</Label>
        <Select
          value={config.colorScheme || "light dark"}
          onValueChange={(value) =>
            onChange({
              colorScheme: value as "light" | "dark" | "light dark",
            })
          }
          disabled={disabled}
        >
          <SelectTrigger id="colorScheme">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="light">Light</SelectItem>
            <SelectItem value="dark">Dark</SelectItem>
            <SelectItem value="light dark">Light & Dark</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="referrer">Referrer Policy</Label>
        <Select
          value={config.referrer || "origin-when-cross-origin"}
          onValueChange={(value) =>
            onChange({
              referrer: value as SEOConfig["referrer"],
            })
          }
          disabled={disabled}
        >
          <SelectTrigger id="referrer">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="no-referrer">No Referrer</SelectItem>
            <SelectItem value="no-referrer-when-downgrade">No Referrer When Downgrade</SelectItem>
            <SelectItem value="origin">Origin</SelectItem>
            <SelectItem value="origin-when-cross-origin">Origin When Cross Origin</SelectItem>
            <SelectItem value="same-origin">Same Origin</SelectItem>
            <SelectItem value="strict-origin">Strict Origin</SelectItem>
            <SelectItem value="strict-origin-when-cross-origin">
              Strict Origin When Cross Origin
            </SelectItem>
            <SelectItem value="unsafe-url">Unsafe URL</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border-t pt-4 space-y-4">
        <h4 className="font-semibold text-sm">Apple Web App</h4>

        <div className="flex items-center justify-between">
          <Label htmlFor="appleCapable">Capable</Label>
          <Switch
            id="appleCapable"
            checked={config.appleWebApp?.capable || false}
            onCheckedChange={(checked: boolean) =>
              onChange({
                appleWebApp: { ...config.appleWebApp, capable: checked },
              })
            }
            disabled={disabled}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="appleTitle">Apple Web App Title</Label>
          <Input
            id="appleTitle"
            value={config.appleWebApp?.title || ""}
            onChange={(e) =>
              onChange({
                appleWebApp: { ...config.appleWebApp, title: e.target.value },
              })
            }
            disabled={disabled}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="appleStatusBar">Status Bar Style</Label>
          <Select
            value={config.appleWebApp?.statusBarStyle || "default"}
            onValueChange={(value) =>
              onChange({
                appleWebApp: {
                  ...config.appleWebApp,
                  statusBarStyle: value as "default" | "black" | "black-translucent",
                },
              })
            }
            disabled={disabled}
          >
            <SelectTrigger id="appleStatusBar">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default</SelectItem>
              <SelectItem value="black">Black</SelectItem>
              <SelectItem value="black-translucent">Black Translucent</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="border-t pt-4 space-y-4">
        <h4 className="font-semibold text-sm">Format Detection</h4>

        <div className="flex items-center justify-between">
          <Label htmlFor="detectTelephone">Telephone</Label>
          <Switch
            id="detectTelephone"
            checked={config.formatDetection?.telephone !== false}
            onCheckedChange={(checked: boolean) =>
              onChange({
                formatDetection: { ...config.formatDetection, telephone: checked },
              })
            }
            disabled={disabled}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="detectEmail">Email</Label>
          <Switch
            id="detectEmail"
            checked={config.formatDetection?.email !== false}
            onCheckedChange={(checked: boolean) =>
              onChange({
                formatDetection: { ...config.formatDetection, email: checked },
              })
            }
            disabled={disabled}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="detectAddress">Address</Label>
          <Switch
            id="detectAddress"
            checked={config.formatDetection?.address !== false}
            onCheckedChange={(checked: boolean) =>
              onChange({
                formatDetection: { ...config.formatDetection, address: checked },
              })
            }
            disabled={disabled}
          />
        </div>
      </div>
    </>
  );
}
