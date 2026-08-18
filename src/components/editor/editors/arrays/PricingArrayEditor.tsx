"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, GripVertical, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LinkSelector } from "@/components/editor/editors/fields/LinkSelector";
import { ComponentConfig, SubPage } from "@/types/landing";

interface PricingPlan {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: { text: string; link: string };
  highlighted: boolean;
  badge?: string;
}

interface PricingArrayEditorProps {
  plans: PricingPlan[];
  onChange: (plans: PricingPlan[]) => void;
  // Props for link selection
  allComponents?: ComponentConfig[];
  subPages?: SubPage[];
  pageSlug?: string;
}

export function PricingArrayEditor({
  plans,
  onChange,
  allComponents = [],
  subPages = [],
  pageSlug,
}: PricingArrayEditorProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const handleAdd = () => {
    onChange([
      ...plans,
      {
        id: `plan-${Date.now()}`,
        name: "New Plan",
        price: "$99",
        period: "per month",
        description: "Perfect for growing businesses",
        features: ["Feature 1", "Feature 2", "Feature 3"],
        cta: { text: "Get Started", link: "#" },
        highlighted: false,
      },
    ]);
    setExpandedIndex(plans.length);
  };

  const handleUpdate = (index: number, updates: Partial<PricingPlan>) => {
    const updated = plans.map((item, i) => (i === index ? { ...item, ...updates } : item));
    onChange(updated);
  };

  const handleDelete = (index: number) => {
    if (confirm("Delete this pricing plan?")) {
      onChange(plans.filter((_, i) => i !== index));
      setExpandedIndex(null);
    }
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= plans.length) return;

    const updated = [...plans];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    onChange(updated);
    setExpandedIndex(newIndex);
  };

  const handleFeatureChange = (planIndex: number, featureIndex: number, value: string) => {
    const plan = plans[planIndex];
    const updatedFeatures = [...plan.features];
    updatedFeatures[featureIndex] = value;
    handleUpdate(planIndex, { features: updatedFeatures });
  };

  const handleAddFeature = (planIndex: number) => {
    const plan = plans[planIndex];
    handleUpdate(planIndex, { features: [...plan.features, "New Feature"] });
  };

  const handleRemoveFeature = (planIndex: number, featureIndex: number) => {
    const plan = plans[planIndex];
    const updatedFeatures = plan.features.filter((_, i) => i !== featureIndex);
    handleUpdate(planIndex, { features: updatedFeatures });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-semibold">Pricing Plans ({plans.length})</Label>
        <Button size="sm" variant="outline" onClick={handleAdd} className="h-8">
          <Plus className="h-3 w-3 mr-1" />
          Add Plan
        </Button>
      </div>

      <div className="space-y-2">
        {plans.map((plan, index) => (
          <Card
            key={index}
            className={`border ${plan.highlighted ? "border-blue-500 bg-blue-50" : "border-gray-200"}`}
          >
            <CardHeader className="p-3 bg-gray-50 cursor-pointer hover:bg-gray-100">
              <div className="flex items-center justify-between">
                <div
                  className="flex items-center gap-2 flex-1"
                  onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                >
                  <GripVertical className="h-4 w-4 text-gray-400" />
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-sm font-medium">{plan.name}</CardTitle>
                    {plan.highlighted && (
                      <Badge variant="default" className="text-xs">
                        Popular
                      </Badge>
                    )}
                    {plan.badge && (
                      <Badge variant="secondary" className="text-xs">
                        {plan.badge}
                      </Badge>
                    )}
                  </div>
                  <span className="text-sm text-gray-600">
                    {plan.price} {plan.period}
                  </span>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMove(index, "up");
                    }}
                    disabled={index === 0}
                    title="Move Up"
                  >
                    ↑
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMove(index, "down");
                    }}
                    disabled={index === plans.length - 1}
                    title="Move Down"
                  >
                    ↓
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0 hover:text-red-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(index);
                    }}
                    title="Delete"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            {expandedIndex === index && (
              <CardContent className="p-3 space-y-3 border-t">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor={`name-${index}`} className="text-xs">
                      Plan Name
                    </Label>
                    <Input
                      id={`name-${index}`}
                      value={plan.name}
                      onChange={(e) => handleUpdate(index, { name: e.target.value })}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor={`price-${index}`} className="text-xs">
                      Price
                    </Label>
                    <Input
                      id={`price-${index}`}
                      value={plan.price}
                      onChange={(e) => handleUpdate(index, { price: e.target.value })}
                      className="h-8 text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor={`period-${index}`} className="text-xs">
                    Period
                  </Label>
                  <Input
                    id={`period-${index}`}
                    value={plan.period}
                    onChange={(e) => handleUpdate(index, { period: e.target.value })}
                    placeholder="per month"
                    className="h-8 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor={`description-${index}`} className="text-xs">
                    Description
                  </Label>
                  <Input
                    id={`description-${index}`}
                    value={plan.description}
                    onChange={(e) => handleUpdate(index, { description: e.target.value })}
                    className="h-8 text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor={`badge-${index}`} className="text-xs">
                      Badge (Optional)
                    </Label>
                    <Input
                      id={`badge-${index}`}
                      value={plan.badge || ""}
                      onChange={(e) => handleUpdate(index, { badge: e.target.value })}
                      placeholder="Popular, Best Value..."
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5 flex items-end">
                    <Button
                      type="button"
                      size="sm"
                      variant={plan.highlighted ? "default" : "outline"}
                      onClick={() => handleUpdate(index, { highlighted: !plan.highlighted })}
                      className="h-8 w-full"
                    >
                      <Star className="h-3 w-3 mr-1" />
                      {plan.highlighted ? "Highlighted" : "Highlight"}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Features ({plan.features.length})</Label>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAddFeature(index)}
                      className="h-6 text-xs"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add
                    </Button>
                  </div>
                  <div className="space-y-1">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex gap-2">
                        <Input
                          value={feature}
                          onChange={(e) => handleFeatureChange(index, featureIndex, e.target.value)}
                          className="h-7 text-xs flex-1"
                          placeholder="Feature description"
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveFeature(index, featureIndex)}
                          className="h-7 w-7 p-0 hover:text-red-600"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 p-2 border border-gray-200 rounded">
                  <Label className="text-xs font-semibold">Call to Action</Label>
                  <div className="space-y-2">
                    <Input
                      value={plan.cta?.text}
                      onChange={(e) =>
                        handleUpdate(index, { cta: { ...plan.cta, text: e.target.value } })
                      }
                      placeholder="Button text"
                      className="h-7 text-xs"
                    />
                    <LinkSelector
                      value={plan.cta?.link || ""}
                      onChange={(value) =>
                        handleUpdate(index, { cta: { ...plan.cta, link: value } })
                      }
                      label=""
                      placeholder="e.g., #contact or /slug/page"
                      components={allComponents}
                      subPages={subPages}
                      pageSlug={pageSlug}
                    />
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {plans.length === 0 && (
        <div className="text-center py-8 text-sm text-gray-500 border-2 border-dashed rounded">
          No pricing plans yet. Click &quot;Add Plan&quot; to get started.
        </div>
      )}
    </div>
  );
}
