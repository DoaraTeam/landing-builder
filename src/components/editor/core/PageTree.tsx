"use client";

import { useState } from "react";
import { ComponentConfig, SubPage } from "@/types/landing";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { getComponentDisplayName } from "@/lib/component-labels";
import {
  Plus,
  Trash2,
  Pencil,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  GripVertical,
  LayoutTemplate,
  FileText,
  MoreVertical,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import SubPageFormDialog from "@/components/editor/core/SubPageFormDialog";
import { ConfirmDialog } from "@/components/editor/dialogs/ConfirmDialog";

export const MAIN_PAGE_ID = "__main__";

interface PageTreeProps {
  mainPageTitle: string;
  mainPageComponents: ComponentConfig[];
  subPages: SubPage[];
  activePageId: string;
  onSelectPage: (pageId: string) => void;
  onUpdateSubPages: (subPages: SubPage[]) => void;
  onSelectSection: (componentId: string) => void;
  onReorderSections: (componentIds: string[]) => void;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  readOnly?: boolean;
}

function SortableSectionItem({
  component,
  activeSectionId,
  onSelectSection,
  readOnly,
}: {
  component: ComponentConfig;
  activeSectionId: string | null;
  onSelectSection: (componentId: string) => void;
  readOnly?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: component.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <li ref={setNodeRef} style={style}>
      <div
        className={`group flex items-center gap-0.5 rounded ${
          component.id === activeSectionId ? "bg-blue-50" : "hover:bg-gray-100"
        }`}
      >
        {!readOnly && (
          <button
            {...attributes}
            {...listeners}
            onClick={(e) => e.stopPropagation()}
            className="shrink-0 cursor-grab text-gray-300 opacity-0 group-hover:opacity-100 active:cursor-grabbing"
          >
            <GripVertical className="h-3 w-3" />
          </button>
        )}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelectSection(component.id);
            document
              .getElementById(component.id)
              ?.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
          className={`flex-1 truncate rounded px-1 py-1 text-left text-xs ${
            component.id === activeSectionId
              ? "text-blue-700 font-medium"
              : component.visible === false
                ? "italic text-gray-400"
                : "text-gray-600"
          }`}
        >
          {getComponentDisplayName(component.type)}
        </button>
      </div>
    </li>
  );
}

function SectionList({
  components,
  activeSectionId,
  onSelectSection,
  onReorderSections,
  readOnly,
}: {
  components: ComponentConfig[];
  activeSectionId: string | null;
  onSelectSection: (componentId: string) => void;
  onReorderSections: (componentIds: string[]) => void;
  readOnly?: boolean;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );
  const sorted = [...components].sort((a, b) => a.order - b.order);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = sorted.findIndex((c) => c.id === active.id);
    const newIndex = sorted.findIndex((c) => c.id === over.id);
    const reordered = arrayMove(sorted, oldIndex, newIndex);
    onReorderSections(reordered.map((c) => c.id));
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={sorted.map((c) => c.id)} strategy={verticalListSortingStrategy}>
        <ul className="ml-6 mt-1 space-y-0.5 border-l border-gray-200 pl-3">
          {sorted.map((component) => (
            <SortableSectionItem
              key={component.id}
              component={component}
              activeSectionId={activeSectionId}
              onSelectSection={onSelectSection}
              readOnly={readOnly}
            />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}

function SortableSubPageRow({
  subPage,
  isActive,
  activeSectionId,
  sectionsExpanded,
  onSelect,
  onSelectSection,
  onReorderSections,
  onToggleSections,
  onToggleVisibility,
  onRename,
  onDelete,
  readOnly,
}: {
  subPage: SubPage;
  isActive: boolean;
  activeSectionId: string | null;
  sectionsExpanded: boolean;
  onSelect: () => void;
  onSelectSection: (componentId: string) => void;
  onReorderSections: (componentIds: string[]) => void;
  onToggleSections: () => void;
  onToggleVisibility: () => void;
  onRename: () => void;
  onDelete: () => void;
  readOnly?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: subPage.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div
        className={`group flex items-center gap-1 rounded-md px-2 py-1.5 text-sm cursor-pointer ${
          isActive ? "bg-blue-50 text-blue-700 font-medium" : "hover:bg-gray-100 text-gray-700"
        }`}
        onClick={onSelect}
      >
        {!readOnly && (
          <button
            {...attributes}
            {...listeners}
            onClick={(e) => e.stopPropagation()}
            className="shrink-0 cursor-grab text-gray-300 hover:text-gray-500 active:cursor-grabbing"
            title="Drag to reorder"
          >
            <GripVertical className="h-3.5 w-3.5" />
          </button>
        )}
        {subPage.icon ? (
          <span className="shrink-0 text-sm">{subPage.icon}</span>
        ) : (
          <FileText className="h-3.5 w-3.5 shrink-0 text-gray-400" />
        )}
        <span className="flex-1 truncate">{subPage.title}</span>
        {!readOnly && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                onClick={(e) => e.stopPropagation()}
                className={`shrink-0 rounded p-1 hover:bg-gray-200 ${
                  isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                }`}
                title="Thao tác khác"
              >
                <MoreVertical className="h-3.5 w-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onToggleVisibility}>
                {subPage.visible ? (
                  <>
                    <EyeOff className="h-3.5 w-3.5" />
                    Ẩn trang
                  </>
                ) : (
                  <>
                    <Eye className="h-3.5 w-3.5" />
                    Hiện trang
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onRename}>
                <Pencil className="h-3.5 w-3.5" />
                Sửa thông tin trang
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={onDelete}
                className="text-red-600 focus:bg-red-50 focus:text-red-600"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Xoá trang
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        {isActive && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleSections();
            }}
            className="shrink-0 rounded p-1 hover:bg-blue-100"
            title={sectionsExpanded ? "Thu gọn danh sách section" : "Mở rộng danh sách section"}
          >
            {sectionsExpanded ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </button>
        )}
      </div>
      {isActive && sectionsExpanded && (
        <SectionList
          components={subPage.components}
          activeSectionId={activeSectionId}
          onSelectSection={onSelectSection}
          onReorderSections={onReorderSections}
          readOnly={readOnly}
        />
      )}
    </div>
  );
}

export default function PageTree({
  mainPageTitle,
  mainPageComponents,
  subPages,
  activePageId,
  onSelectPage,
  onUpdateSubPages,
  onSelectSection,
  onReorderSections,
  collapsed,
  onToggleCollapsed,
  readOnly,
}: PageTreeProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [subPageToEdit, setSubPageToEdit] = useState<SubPage | null>(null);
  const [subPageToDelete, setSubPageToDelete] = useState<string | null>(null);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  // Per-page collapse state for the section list, keyed by page id. Absent
  // (or true) means expanded — only an explicit `false` collapses it.
  const [sectionsExpandedMap, setSectionsExpandedMap] = useState<Record<string, boolean>>({});

  const isSectionsExpanded = (pageId: string) => sectionsExpandedMap[pageId] !== false;

  const toggleSections = (pageId: string) => {
    setSectionsExpandedMap((prev) => ({ ...prev, [pageId]: !isSectionsExpanded(pageId) }));
  };

  const handleSelectSection = (componentId: string) => {
    setActiveSectionId(componentId);
    onSelectSection(componentId);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const sortedSubPages = [...subPages].sort((a, b) => a.order - b.order);

  const handleAddClick = () => {
    setSubPageToEdit(null);
    setFormOpen(true);
  };

  const handleRenameClick = (subPage: SubPage) => {
    setSubPageToEdit(subPage);
    setFormOpen(true);
  };

  const handleSaveSubPage = (subPage: SubPage) => {
    const exists = subPages.some((sp) => sp.id === subPage.id);
    onUpdateSubPages(
      exists ? subPages.map((sp) => (sp.id === subPage.id ? subPage : sp)) : [...subPages, subPage]
    );
  };

  const handleDeleteSubPage = (id: string) => {
    setSubPageToDelete(id);
  };

  const confirmDeleteSubPage = () => {
    if (!subPageToDelete) return;
    onUpdateSubPages(subPages.filter((sp) => sp.id !== subPageToDelete));
    setSubPageToDelete(null);
  };

  const handleToggleVisibility = (id: string) => {
    onUpdateSubPages(subPages.map((sp) => (sp.id === id ? { ...sp, visible: !sp.visible } : sp)));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = sortedSubPages.findIndex((sp) => sp.id === active.id);
    const newIndex = sortedSubPages.findIndex((sp) => sp.id === over.id);
    const reordered = arrayMove(sortedSubPages, oldIndex, newIndex).map((sp, index) => ({
      ...sp,
      order: index,
    }));
    onUpdateSubPages(reordered);
  };

  if (collapsed) {
    return (
      <TooltipProvider delayDuration={200}>
        <div className="flex h-full w-12 flex-col items-center gap-1 border-r bg-white py-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onToggleCollapsed}
                className="mb-2 rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">Expand sidebar</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => onSelectPage(MAIN_PAGE_ID)}
                className={`rounded-md p-2 ${
                  activePageId === MAIN_PAGE_ID
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                <LayoutTemplate className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">{mainPageTitle}</TooltipContent>
          </Tooltip>

          {sortedSubPages.map((sp) => (
            <Tooltip key={sp.id}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onSelectPage(sp.id)}
                  className={`rounded-md p-2 text-sm ${
                    activePageId === sp.id
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-500 hover:bg-gray-100"
                  }`}
                >
                  {sp.icon || <FileText className="h-4 w-4" />}
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">{sp.title}</TooltipContent>
            </Tooltip>
          ))}
        </div>
      </TooltipProvider>
    );
  }

  return (
    <div className="flex h-full w-64 flex-col border-r bg-white">
      <div className="flex items-center justify-between border-b px-3 py-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Pages</span>
        <TooltipProvider delayDuration={200}>
          <div className="flex items-center gap-1">
            {!readOnly && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleAddClick}>
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Add page</TooltipContent>
              </Tooltip>
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onToggleCollapsed}>
                  <ChevronLeft className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Collapse sidebar</TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {/* Main page — always first, not reorderable/deletable */}
        <div
          className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-sm cursor-pointer ${
            activePageId === MAIN_PAGE_ID
              ? "bg-blue-50 text-blue-700 font-medium"
              : "hover:bg-gray-100 text-gray-700"
          }`}
          onClick={() => onSelectPage(MAIN_PAGE_ID)}
        >
          <LayoutTemplate className="h-3.5 w-3.5 shrink-0 text-gray-400" />
          <span className="flex-1 truncate">{mainPageTitle}</span>
          {activePageId === MAIN_PAGE_ID && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleSections(MAIN_PAGE_ID);
              }}
              className="shrink-0 rounded p-1 hover:bg-blue-100"
              title={
                isSectionsExpanded(MAIN_PAGE_ID)
                  ? "Thu gọn danh sách section"
                  : "Mở rộng danh sách section"
              }
            >
              {isSectionsExpanded(MAIN_PAGE_ID) ? (
                <ChevronUp className="h-3.5 w-3.5" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" />
              )}
            </button>
          )}
        </div>
        {activePageId === MAIN_PAGE_ID && isSectionsExpanded(MAIN_PAGE_ID) && (
          <SectionList
            components={mainPageComponents}
            activeSectionId={activeSectionId}
            onSelectSection={handleSelectSection}
            onReorderSections={onReorderSections}
            readOnly={readOnly}
          />
        )}

        <div className="my-2 border-t" />

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext
            items={sortedSubPages.map((sp) => sp.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-0.5">
              {sortedSubPages.map((subPage) => (
                <SortableSubPageRow
                  key={subPage.id}
                  subPage={subPage}
                  isActive={activePageId === subPage.id}
                  activeSectionId={activeSectionId}
                  sectionsExpanded={isSectionsExpanded(subPage.id)}
                  onSelect={() => onSelectPage(subPage.id)}
                  onSelectSection={handleSelectSection}
                  onReorderSections={onReorderSections}
                  onToggleSections={() => toggleSections(subPage.id)}
                  onToggleVisibility={() => handleToggleVisibility(subPage.id)}
                  onRename={() => handleRenameClick(subPage)}
                  onDelete={() => handleDeleteSubPage(subPage.id)}
                  readOnly={readOnly}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {sortedSubPages.length === 0 && (
          <p className="px-2 py-4 text-center text-xs text-gray-400">Chưa có trang con nào</p>
        )}
      </div>

      <SubPageFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        subPageToEdit={subPageToEdit}
        existingSubPages={subPages}
        mainPageComponents={mainPageComponents}
        onSave={handleSaveSubPage}
      />

      <ConfirmDialog
        open={!!subPageToDelete}
        onOpenChange={(open) => !open && setSubPageToDelete(null)}
        title="Xóa trang?"
        description="Bạn có chắc muốn xóa trang này? Hành động này không thể hoàn tác."
        confirmText="Xóa"
        variant="destructive"
        onConfirm={confirmDeleteSubPage}
      />
    </div>
  );
}
