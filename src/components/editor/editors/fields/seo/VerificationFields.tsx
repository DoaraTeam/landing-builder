"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { InfoTooltip } from "@/components/editor/editors/fields/InfoTooltip";
import { SEOConfig } from "@/types/landing";

interface VerificationFieldsProps {
  config: SEOConfig;
  onChange: (updates: Partial<SEOConfig>) => void;
  disabled?: boolean;
}

/** The "Xác minh" (Verification) tab's fields — extracted verbatim from
 * SEOEditor.tsx. */
export function VerificationFields({
  config,
  onChange,
  disabled = false,
}: VerificationFieldsProps) {
  return (
    <>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="googleVerification">Google Verification</Label>
          <InfoTooltip text="Mã xác minh Google Search Console." />
        </div>
        <Input
          id="googleVerification"
          value={config.verification?.google || ""}
          onChange={(e) =>
            onChange({
              verification: { ...config.verification, google: e.target.value },
            })
          }
          disabled={disabled}
          placeholder="Mã xác minh Google"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="bingVerification">Bing Verification</Label>
          <InfoTooltip text="Mã xác minh Bing Webmaster Tools." />
        </div>
        <Input
          id="bingVerification"
          value={config.verification?.bing || ""}
          onChange={(e) =>
            onChange({
              verification: { ...config.verification, bing: e.target.value },
            })
          }
          disabled={disabled}
          placeholder="Mã xác minh Bing"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="yandexVerification">Yandex Verification</Label>
          <InfoTooltip text="Mã xác minh Yandex Webmaster." />
        </div>
        <Input
          id="yandexVerification"
          value={config.verification?.yandex || ""}
          onChange={(e) =>
            onChange({
              verification: { ...config.verification, yandex: e.target.value },
            })
          }
          disabled={disabled}
          placeholder="Mã xác minh Yandex"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="yahooVerification">Yahoo Verification</Label>
          <InfoTooltip text="Mã xác minh Yahoo." />
        </div>
        <Input
          id="yahooVerification"
          value={config.verification?.yahoo || ""}
          onChange={(e) =>
            onChange({
              verification: { ...config.verification, yahoo: e.target.value },
            })
          }
          disabled={disabled}
          placeholder="Mã xác minh Yahoo"
        />
      </div>
    </>
  );
}
