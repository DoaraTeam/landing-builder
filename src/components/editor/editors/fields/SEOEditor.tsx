"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SEOConfig } from "@/types/landing";
import { BasicSEOFields } from "@/components/editor/editors/fields/seo/BasicSEOFields";
import { OpenGraphFields } from "@/components/editor/editors/fields/seo/OpenGraphFields";
import { TwitterFields } from "@/components/editor/editors/fields/seo/TwitterFields";
import { RobotsFields } from "@/components/editor/editors/fields/seo/RobotsFields";
import { VerificationFields } from "@/components/editor/editors/fields/seo/VerificationFields";
import { AdvancedFields } from "@/components/editor/editors/fields/seo/AdvancedFields";

interface SEOEditorProps {
  config: SEOConfig;
  onChange: (config: SEOConfig) => void;
  disabled?: boolean;
}

export default function SEOEditor({ config, onChange, disabled = false }: SEOEditorProps) {
  const [activeTab, setActiveTab] = useState("basic");

  const updateConfig = (updates: Partial<SEOConfig>) => {
    onChange({ ...config, ...updates });
  };

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6 h-auto">
          <TabsTrigger value="basic" className="text-xs">
            Cơ bản
          </TabsTrigger>
          <TabsTrigger value="opengraph" className="text-xs">
            Open Graph
          </TabsTrigger>
          <TabsTrigger value="twitter" className="text-xs">
            Twitter
          </TabsTrigger>
          <TabsTrigger value="robots" className="text-xs">
            Robots
          </TabsTrigger>
          <TabsTrigger value="verification" className="text-xs">
            Xác minh
          </TabsTrigger>
          <TabsTrigger value="advanced" className="text-xs">
            Nâng cao
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4 mt-4">
          <BasicSEOFields config={config} onChange={updateConfig} disabled={disabled} />
        </TabsContent>

        <TabsContent value="opengraph" className="space-y-4 mt-4">
          <OpenGraphFields config={config} onChange={updateConfig} disabled={disabled} />
        </TabsContent>

        <TabsContent value="twitter" className="space-y-4 mt-4">
          <TwitterFields config={config} onChange={updateConfig} disabled={disabled} />
        </TabsContent>

        <TabsContent value="robots" className="space-y-4 mt-4">
          <RobotsFields config={config} onChange={updateConfig} disabled={disabled} />
        </TabsContent>

        <TabsContent value="verification" className="space-y-4 mt-4">
          <VerificationFields config={config} onChange={updateConfig} disabled={disabled} />
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4 mt-4">
          <AdvancedFields config={config} onChange={updateConfig} disabled={disabled} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
