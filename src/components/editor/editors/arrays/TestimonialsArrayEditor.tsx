"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, GripVertical, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Testimonial {
  id: string;
  content: string;
  author: string;
  role: string;
  company: string;
  rating: number;
  avatar?: string;
}

interface TestimonialsArrayEditorProps {
  testimonials: Testimonial[];
  onChange: (testimonials: Testimonial[]) => void;
}

export function TestimonialsArrayEditor({ testimonials, onChange }: TestimonialsArrayEditorProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const handleAdd = () => {
    onChange([
      ...testimonials,
      {
        id: `testimonial-${Date.now()}`,
        content: "This product has been amazing! I highly recommend it to everyone.",
        author: "John Doe",
        role: "CEO",
        company: "Tech Company",
        rating: 5,
        avatar: "",
      },
    ]);
    setExpandedIndex(testimonials.length);
  };

  const handleUpdate = (index: number, updates: Partial<Testimonial>) => {
    const updated = testimonials.map((item, i) => (i === index ? { ...item, ...updates } : item));
    onChange(updated);
  };

  const handleDelete = (index: number) => {
    if (confirm("Delete this testimonial?")) {
      onChange(testimonials.filter((_, i) => i !== index));
      setExpandedIndex(null);
    }
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= testimonials.length) return;

    const updated = [...testimonials];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    onChange(updated);
    setExpandedIndex(newIndex);
  };

  const renderStars = (rating: number, onRatingChange: (rating: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 cursor-pointer ${
              star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
            }`}
            onClick={() => onRatingChange(star)}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-semibold">Testimonials ({testimonials.length})</Label>
        <Button size="sm" variant="outline" onClick={handleAdd} className="h-8">
          <Plus className="h-3 w-3 mr-1" />
          Add Testimonial
        </Button>
      </div>

      <div className="space-y-2">
        {testimonials.map((testimonial, index) => (
          <Card key={index} className="border border-gray-200">
            <CardHeader className="p-3 bg-gray-50 cursor-pointer hover:bg-gray-100">
              <div className="flex items-center justify-between">
                <div
                  className="flex items-center gap-2 flex-1"
                  onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                >
                  <GripVertical className="h-4 w-4 text-gray-400" />
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-sm font-medium">{testimonial.author}</CardTitle>
                    <span className="text-xs text-gray-500">
                      {testimonial.role} at {testimonial.company}
                    </span>
                    <div className="flex">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
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
                    disabled={index === testimonials.length - 1}
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
                <div className="space-y-1.5">
                  <Label htmlFor={`content-${index}`} className="text-xs">
                    Testimonial Content
                  </Label>
                  <textarea
                    id={`content-${index}`}
                    value={testimonial.content}
                    onChange={(e) => handleUpdate(index, { content: e.target.value })}
                    placeholder="Enter testimonial content..."
                    className="w-full min-h-[80px] px-3 py-2 border border-gray-300 rounded-md text-sm resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor={`author-${index}`} className="text-xs">
                      Author Name
                    </Label>
                    <Input
                      id={`author-${index}`}
                      value={testimonial.author}
                      onChange={(e) => handleUpdate(index, { author: e.target.value })}
                      placeholder="John Doe"
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor={`role-${index}`} className="text-xs">
                      Role/Position
                    </Label>
                    <Input
                      id={`role-${index}`}
                      value={testimonial.role}
                      onChange={(e) => handleUpdate(index, { role: e.target.value })}
                      placeholder="CEO"
                      className="h-8 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor={`company-${index}`} className="text-xs">
                      Company
                    </Label>
                    <Input
                      id={`company-${index}`}
                      value={testimonial.company}
                      onChange={(e) => handleUpdate(index, { company: e.target.value })}
                      placeholder="Tech Company"
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Rating</Label>
                    <div className="pt-1">
                      {renderStars(testimonial.rating, (rating) => handleUpdate(index, { rating }))}
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor={`avatar-${index}`} className="text-xs">
                    Avatar URL (Optional)
                  </Label>
                  <Input
                    id={`avatar-${index}`}
                    value={testimonial.avatar || ""}
                    onChange={(e) => handleUpdate(index, { avatar: e.target.value })}
                    placeholder="https://..."
                    className="h-8 text-sm"
                  />
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {testimonials.length === 0 && (
        <div className="text-center py-8 text-sm text-gray-500 border-2 border-dashed rounded">
          No testimonials yet. Click &quot;Add Testimonial&quot; to get started.
        </div>
      )}
    </div>
  );
}
