"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Facebook, Twitter, Linkedin, Github } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LinkSelector } from "@/components/editor/editors/fields/LinkSelector";
import { ComponentConfig, SubPage } from "@/types/landing";
import { ConfirmDialog } from "@/components/editor/dialogs/ConfirmDialog";

interface FooterLink {
  text: string;
  link: string;
}

interface FooterLinkGroup {
  title: string;
  items: FooterLink[];
}

interface SocialLink {
  platform: string;
  link: string;
  icon: string;
}

interface FooterConfig {
  logo: { text: string; image: string };
  description: string;
  links?: FooterLinkGroup[];
  social?: SocialLink[];
  copyright: string;
}

interface FooterLinksEditorProps {
  footerConfig: FooterConfig;
  onChange: (config: FooterConfig) => void;
  // Props for link selection
  allComponents?: ComponentConfig[];
  subPages?: SubPage[];
  pageSlug?: string;
}

type PendingDelete =
  | { type: "group"; groupIndex: number }
  | { type: "link"; groupIndex: number; linkIndex: number }
  | { type: "social"; index: number };

const socialIcons = {
  facebook: Facebook,
  twitter: Twitter,
  linkedin: Linkedin,
  github: Github,
};

export function FooterLinksEditor({
  footerConfig,
  onChange,
  allComponents = [],
  subPages = [],
  pageSlug,
}: FooterLinksEditorProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);

  const handleUpdateLinkGroup = (index: number, updates: Partial<FooterLinkGroup>) => {
    const updatedLinks = (footerConfig.links || []).map((group, i) =>
      i === index ? { ...group, ...updates } : group
    );
    onChange({ ...footerConfig, links: updatedLinks });
  };

  const handleAddLinkGroup = () => {
    onChange({
      ...footerConfig,
      links: [
        ...(footerConfig.links || []),
        { title: "New Section", items: [{ text: "Link 1", link: "#" }] },
      ],
    });
  };

  const handleDeleteLinkGroup = (index: number) => {
    setPendingDelete({ type: "group", groupIndex: index });
  };

  const handleUpdateLink = (
    groupIndex: number,
    linkIndex: number,
    updates: Partial<FooterLink>
  ) => {
    const group = (footerConfig.links || [])[groupIndex];
    if (!group) return;
    const updatedItems = group.items?.map((item, i) =>
      i === linkIndex ? { ...item, ...updates } : item
    );
    handleUpdateLinkGroup(groupIndex, { items: updatedItems });
  };

  const handleAddLink = (groupIndex: number) => {
    const group = (footerConfig.links || [])[groupIndex];
    if (!group) return;
    handleUpdateLinkGroup(groupIndex, {
      items: [...group.items, { text: "New Link", link: "#" }],
    });
  };

  const handleDeleteLink = (groupIndex: number, linkIndex: number) => {
    setPendingDelete({ type: "link", groupIndex, linkIndex });
  };

  const handleUpdateSocial = (index: number, updates: Partial<SocialLink>) => {
    const updatedSocial = (footerConfig.social || []).map((item, i) =>
      i === index ? { ...item, ...updates } : item
    );
    onChange({ ...footerConfig, social: updatedSocial });
  };

  const handleAddSocial = () => {
    onChange({
      ...footerConfig,
      social: [
        ...(footerConfig.social || []),
        { platform: "facebook", link: "#", icon: "facebook" },
      ],
    });
  };

  const handleDeleteSocial = (index: number) => {
    setPendingDelete({ type: "social", index });
  };

  const confirmPendingDelete = () => {
    if (!pendingDelete) return;

    if (pendingDelete.type === "group") {
      onChange({
        ...footerConfig,
        links: (footerConfig.links || []).filter((_, i) => i !== pendingDelete.groupIndex),
      });
    } else if (pendingDelete.type === "link") {
      const group = (footerConfig.links || [])[pendingDelete.groupIndex];
      if (group) {
        const updatedItems = group.items?.filter((_, i) => i !== pendingDelete.linkIndex);
        handleUpdateLinkGroup(pendingDelete.groupIndex, { items: updatedItems });
      }
    } else if (pendingDelete.type === "social") {
      onChange({
        ...footerConfig,
        social: (footerConfig.social || []).filter((_, i) => i !== pendingDelete.index),
      });
    }

    setPendingDelete(null);
  };

  const pendingDeleteCopy = (() => {
    if (!pendingDelete) return { title: "", description: "" };
    if (pendingDelete.type === "group") {
      return {
        title: "Delete link group?",
        description:
          "This will delete the group and all links inside it. This action cannot be undone.",
      };
    }
    if (pendingDelete.type === "link") {
      return { title: "Delete link?", description: "This action cannot be undone." };
    }
    return { title: "Delete social link?", description: "This action cannot be undone." };
  })();

  return (
    <div className="space-y-4">
      {/* Logo & Description */}
      <Card className="border border-gray-200">
        <CardHeader
          className="p-3 bg-gray-50 cursor-pointer hover:bg-gray-100"
          onClick={() => setExpandedSection(expandedSection === "logo" ? null : "logo")}
        >
          <CardTitle className="text-sm font-medium">Logo & Description</CardTitle>
        </CardHeader>
        {expandedSection === "logo" && (
          <CardContent className="p-3 space-y-3 border-t">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Logo Text</Label>
                <Input
                  value={footerConfig.logo.text}
                  onChange={(e) =>
                    onChange({
                      ...footerConfig,
                      logo: { ...footerConfig.logo, text: e.target.value },
                    })
                  }
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Logo Image URL</Label>
                <Input
                  value={footerConfig.logo.image}
                  onChange={(e) =>
                    onChange({
                      ...footerConfig,
                      logo: { ...footerConfig.logo, image: e.target.value },
                    })
                  }
                  placeholder="https://..."
                  className="h-8 text-sm"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Description</Label>
              <textarea
                value={footerConfig.description}
                onChange={(e) => onChange({ ...footerConfig, description: e.target.value })}
                className="w-full min-h-[60px] px-3 py-2 border border-gray-300 rounded-md text-sm resize-none"
              />
            </div>
          </CardContent>
        )}
      </Card>

      {/* Link Groups */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-semibold">
            Link Groups ({footerConfig.links?.length || 0})
          </Label>
          <Button size="sm" variant="outline" onClick={handleAddLinkGroup} className="h-8">
            <Plus className="h-3 w-3 mr-1" />
            Add Group
          </Button>
        </div>

        {(footerConfig.links || []).map((group, groupIndex) => (
          <Card key={groupIndex} className="border border-gray-200">
            <CardHeader className="p-3 bg-gray-50 cursor-pointer hover:bg-gray-100">
              <div className="flex items-center justify-between">
                <div
                  className="flex items-center gap-2 flex-1"
                  onClick={() =>
                    setExpandedSection(
                      expandedSection === `group-${groupIndex}` ? null : `group-${groupIndex}`
                    )
                  }
                >
                  <CardTitle className="text-sm font-medium">{group.title}</CardTitle>
                  <span className="text-xs text-gray-500">({group.items?.length} links)</span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0 hover:text-red-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteLinkGroup(groupIndex);
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardHeader>

            {expandedSection === `group-${groupIndex}` && (
              <CardContent className="p-3 space-y-3 border-t">
                <div className="space-y-1.5">
                  <Label className="text-xs">Group Title</Label>
                  <Input
                    value={group.title}
                    onChange={(e) => handleUpdateLinkGroup(groupIndex, { title: e.target.value })}
                    className="h-8 text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Links ({group.items?.length})</Label>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAddLink(groupIndex)}
                      className="h-6 text-xs"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add Link
                    </Button>
                  </div>
                  {group.items?.map((link, linkIndex) => (
                    <div key={linkIndex} className="space-y-2 p-2 border border-gray-100 rounded">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Link {linkIndex + 1}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteLink(groupIndex, linkIndex)}
                          className="h-6 w-6 p-0 hover:text-red-600"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      <Input
                        value={link.text}
                        onChange={(e) =>
                          handleUpdateLink(groupIndex, linkIndex, { text: e.target.value })
                        }
                        placeholder="Link text"
                        className="h-7 text-xs"
                      />
                      <LinkSelector
                        value={link.link}
                        onChange={(value) =>
                          handleUpdateLink(groupIndex, linkIndex, { link: value })
                        }
                        label=""
                        placeholder="e.g., #contact or /slug/page"
                        components={allComponents}
                        subPages={subPages}
                        pageSlug={pageSlug}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* Social Links */}
      <Card className="border border-gray-200">
        <CardHeader
          className="p-3 bg-gray-50 cursor-pointer hover:bg-gray-100"
          onClick={() => setExpandedSection(expandedSection === "social" ? null : "social")}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">
              Social Links ({footerConfig.social?.length || 0})
            </CardTitle>
            <Button size="sm" variant="outline" onClick={handleAddSocial} className="h-6 text-xs">
              <Plus className="h-3 w-3 mr-1" />
              Add Social
            </Button>
          </div>
        </CardHeader>
        {expandedSection === "social" && (
          <CardContent className="p-3 space-y-3 border-t">
            {(footerConfig.social || []).map((social, index) => (
              <div key={index} className="border border-gray-200 rounded-md p-3 space-y-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-700">Social #{index + 1}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteSocial(index)}
                    className="h-6 w-6 p-0 hover:text-red-600"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
                <div className="space-y-2">
                  <div>
                    <label className="text-xs text-gray-600 block mb-1">Platform</label>
                    <select
                      value={social.platform}
                      onChange={(e) =>
                        handleUpdateSocial(index, {
                          platform: e.target.value,
                          icon: e.target.value,
                        })
                      }
                      className="w-full h-8 text-xs border border-gray-300 rounded px-2"
                    >
                      <option value="facebook">Facebook</option>
                      <option value="twitter">Twitter</option>
                      <option value="linkedin">LinkedIn</option>
                      <option value="github">GitHub</option>
                    </select>
                  </div>
                  <LinkSelector
                    value={social.link}
                    onChange={(value) => handleUpdateSocial(index, { link: value })}
                    label="Link"
                    placeholder="e.g., https://facebook.com/yourpage"
                    components={allComponents}
                    subPages={subPages}
                    pageSlug={pageSlug}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        )}
      </Card>

      {/* Copyright */}
      <Card className="border border-gray-200">
        <CardHeader
          className="p-3 bg-gray-50 cursor-pointer hover:bg-gray-100"
          onClick={() => setExpandedSection(expandedSection === "copyright" ? null : "copyright")}
        >
          <CardTitle className="text-sm font-medium">Copyright</CardTitle>
        </CardHeader>
        {expandedSection === "copyright" && (
          <CardContent className="p-3 border-t">
            <Input
              value={footerConfig.copyright}
              onChange={(e) => onChange({ ...footerConfig, copyright: e.target.value })}
              placeholder="© 2024 Your Company. All rights reserved."
              className="h-8 text-sm"
            />
          </CardContent>
        )}
      </Card>

      <ConfirmDialog
        open={!!pendingDelete}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title={pendingDeleteCopy.title}
        description={pendingDeleteCopy.description}
        confirmText="Delete"
        variant="destructive"
        onConfirm={confirmPendingDelete}
      />
    </div>
  );
}
