"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  description?: string;
  showDefaultLogos?: boolean; // Show default logo options for headers
}

export function ImageUpload({
  value,
  onChange,
  label,
  description,
  showDefaultLogos = false,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(value || "");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Default logo options
  const defaultLogos = [
    { name: "Modern", url: "/assets/images/default-logo.svg" },
    { name: "Geometric", url: "/assets/images/logo-modern.svg" },
    { name: "Tech", url: "/assets/images/logo-tech.svg" },
    { name: "Simple", url: "/assets/images/logo-simple.svg" },
  ];

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.warning({
        title: "Invalid File",
        description: "Please select an image file",
      });
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.warning({
        title: "File Too Large",
        description: "Image must be less than 10MB",
      });
      return;
    }

    setUploading(true);

    try {
      // Upload to API
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();

      // Set preview and update value
      setPreview(data.url);
      onChange(data.url);

      toast.success({
        title: "Success",
        description: "Image uploaded successfully",
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast.error({
        title: "Upload Failed",
        description: "Failed to upload image. Please try again.",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview("");
    onChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-medium block">{label}</label>}
      {description && <p className="text-sm text-gray-500">{description}</p>}

      {/* Default logo options (only show for header logos) */}
      {showDefaultLogos && !preview && (
        <div className="mb-3">
          <p className="text-xs font-medium text-gray-600 mb-2">
            Quick Start - Choose a default logo:
          </p>
          <div className="grid grid-cols-2 gap-2">
            {defaultLogos.map((logo) => (
              <button
                key={logo.url}
                type="button"
                onClick={() => {
                  setPreview(logo.url);
                  onChange(logo.url);
                  toast.success({
                    title: "Logo Selected",
                    description: `${logo.name} logo selected`,
                  });
                }}
                className="border-2 border-gray-200 rounded-lg p-3 hover:border-blue-400 hover:bg-blue-50 transition-all flex flex-col items-center gap-1 group"
              >
                <img src={logo.url} alt={logo.name} className="h-8 w-auto object-contain" />
                <span className="text-xs text-gray-600 group-hover:text-blue-600 font-medium">
                  {logo.name}
                </span>
              </button>
            ))}
          </div>
          <div className="text-center my-2">
            <span className="text-xs text-gray-400">or upload your own</span>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {preview ? (
          <div className="relative border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
            <img src={preview} alt="Preview" className="w-full h-48 object-cover" />
            <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-40 transition-all flex items-center justify-center opacity-0 hover:opacity-100">
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleRemove}
                className="gap-1"
              >
                <X className="h-4 w-4" />
                Remove
              </Button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleClick}
            disabled={uploading}
            className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors flex flex-col items-center justify-center gap-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                <span className="text-sm">Uploading...</span>
              </>
            ) : (
              <>
                <ImageIcon className="h-8 w-8" />
                <span className="text-sm font-medium">Click to upload image</span>
                <span className="text-xs">PNG, JPG, GIF up to 10MB</span>
              </>
            )}
          </button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {preview && (
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClick}
              disabled={uploading}
              className="flex-1 gap-1"
            >
              <Upload className="h-4 w-4" />
              Change Image
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRemove}
              className="gap-1"
            >
              <X className="h-4 w-4" />
              Remove
            </Button>
          </div>
        )}

        {/* Show default logos even when preview exists (for easy switching) */}
        {showDefaultLogos && preview && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-xs font-medium text-gray-600 mb-2">Or choose a different default:</p>
            <div className="grid grid-cols-4 gap-2">
              {defaultLogos.map((logo) => (
                <button
                  key={logo.url}
                  type="button"
                  onClick={() => {
                    setPreview(logo.url);
                    onChange(logo.url);
                    toast.success({
                      title: "Logo Changed",
                      description: `Switched to ${logo.name} logo`,
                    });
                  }}
                  className={`border-2 rounded p-2 hover:border-blue-400 transition-all flex flex-col items-center gap-1 ${
                    preview === logo.url ? "border-blue-500 bg-blue-50" : "border-gray-200"
                  }`}
                >
                  <img src={logo.url} alt={logo.name} className="h-6 w-auto object-contain" />
                  <span className="text-[10px] text-gray-600">{logo.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
