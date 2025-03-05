"use client"

import React, { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { 
  Search,
  MoveVertical,
  Copy,
  Check,
  ChevronRight,
  ChevronDown,
  GripVertical
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { format } from "date-fns"
import { Spinner } from "@/components/ui/spinner"
import CreateCategory from "./create-category";
import EditCategory from "./edit-category";
import DeleteCategory from "./delete-category";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

interface CategoryParent {
  id: string;
  nameEn: string;
  nameAr: string;
}

interface CategoryCount {
  promptCategories: number;
  children: number;
  prompts?: number;
  subcategories?: number;
}

interface Category {
  id: string;
  name: string;
  nameEn: string;
  nameAr: string;
  iconName: string;
  sortOrder: number;
  parentId: string | null;
  parent?: CategoryParent | null;
  createdAt: string;
  updatedAt: string;
  children?: Category[];
  subcategories?: Category[];
  _count: CategoryCount;
}

interface SortableCategoryRowProps {
  category: Category;
  level?: number;
  onToggleExpand: (id: string) => void;
  isExpanded: boolean;
  onCopyId: (id: string) => void;
  copiedId: string | null;
  onSortOrderChange: (id: string, order: number) => void;
  queryClient: any;
  children?: React.ReactNode;
}

async function fetchCategories(): Promise<Category[]> {
  const response = await fetch('/api/cms/categories');
  if (!response.ok) {
    throw new Error('Failed to fetch categories');
  }
  const data = await response.json();
  return data.data || [];
}

async function updateCategorySortOrder(id: string, sortOrder: number): Promise<Category> {
  const response = await fetch('/api/cms/categories', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ id, sortOrder }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to update category sort order');
  }
  
  return response.json();
}

async function reorderCategories(categories: { id: string; sortOrder: number }[]): Promise<Category[]> {
  const response = await fetch('/api/cms/categories/reorder', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ categories }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to reorder categories');
  }
  
  return response.json();
}

function organizeCategories(categories: Category[]): Category[] {
  const categoryMap = new Map<string | null, Category[]>();
  
  categoryMap.set(null, []);
  categories.forEach(category => {
    categoryMap.set(category.id, []);
  });
  
  categories.forEach(category => {
    const parentId = category.parentId;
    if (categoryMap.has(parentId)) {
      categoryMap.get(parentId)!.push(category);
    }
  });
  
  const topLevelCategories = categoryMap.get(null)!.sort((a, b) => a.sortOrder - b.sortOrder);
  
  topLevelCategories.forEach(category => {
    category.children = categoryMap.get(category.id)!.sort((a, b) => a.sortOrder - b.sortOrder);
  });
  
  return topLevelCategories;
}

function SortableCategoryRow({ 
  category, 
  level = 0, 
  onToggleExpand, 
  isExpanded, 
  onCopyId, 
  copiedId, 
  onSortOrderChange,
  queryClient,
  children
}: SortableCategoryRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const hasChildren = category.children && category.children.length > 0;
  
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
    } catch (error) {
      return 'Invalid date';
    }
  };

  const truncateId = (id: string) => {
    return id.length > 8 ? `${id.substring(0, 8)}...` : id;
  };

  return (
    <TableRow 
      ref={setNodeRef} 
      style={style} 
      className={`${level > 0 ? "bg-gray-50" : ""} ${isDragging ? "z-10" : ""}`}
    >
      <TableCell>
        <div className="flex items-center space-x-2">
          {hasChildren && (
            <button 
              onClick={() => onToggleExpand(category.id)}
              className="p-1 rounded-full hover:bg-gray-200"
              aria-label={isExpanded ? "Collapse category" : "Expand category"}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-gray-600" aria-hidden="true" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-600" aria-hidden="true" />
              )}
            </button>
          )}
          {!hasChildren && <div className="w-6" />}
          <div className="flex items-center space-x-2">
            <div 
              {...attributes} 
              {...listeners}
              className="cursor-grab active:cursor-grabbing"
              aria-label="Drag to reorder"
            >
              <GripVertical className="h-4 w-4 text-gray-400" aria-hidden="true" />
            </div>
            <Input
              type="number"
              value={category.sortOrder}
              onChange={(e) => onSortOrderChange(category.id, parseInt(e.target.value))}
              className="w-16 h-8 text-sm"
              aria-label="Sort order"
            />
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div 
          className="flex items-center space-x-1 cursor-pointer"
          onClick={() => onCopyId(category.id)}
          title={category.id}
          role="button"
          aria-label="Copy category ID"
        >
          <span className="text-xs text-gray-600">{truncateId(category.id)}</span>
          {copiedId === category.id ? (
            <Check className="h-3.5 w-3.5 text-green-500" aria-hidden="true" />
          ) : (
            <Copy className="h-3.5 w-3.5 text-gray-400" aria-hidden="true" />
          )}
        </div>
      </TableCell>
      <TableCell className="font-medium">
        <div style={{ paddingLeft: `${level * 16}px` }}>
          {category.nameEn}
        </div>
      </TableCell>
      <TableCell>{category.nameAr}</TableCell>
      <TableCell>{category.iconName}</TableCell>
      <TableCell>
        {category.parent ? category.parent.nameEn : 
          <span className="text-gray-400 text-sm">None</span>}
      </TableCell>
      <TableCell className="text-xs text-gray-600">{formatDate(category.createdAt)}</TableCell>
      <TableCell className="text-xs text-gray-600">{formatDate(category.updatedAt)}</TableCell>
      <TableCell>{category._count.prompts || category._count.promptCategories || 0}</TableCell>
      <TableCell>
        <div className="flex space-x-2">
          <EditCategory 
            category={category} 
            onSuccess={() => queryClient.invalidateQueries({ queryKey: ['cms-categories'] })} 
          />
          <DeleteCategory 
            category={category} 
            onSuccess={() => queryClient.invalidateQueries({ queryKey: ['cms-categories'] })} 
          />
        </div>
      </TableCell>
    </TableRow>
  );
}

function CategoriesManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("sortOrder");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const queryClient = useQueryClient();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const { 
    data: categoriesData = [], 
    isLoading, 
    isError,
    error 
  } = useQuery({
    queryKey: ['cms-categories'],
    queryFn: fetchCategories,
  });

  const { mutate: updateSortOrder } = useMutation({
    mutationFn: ({ id, sortOrder }: { id: string; sortOrder: number }) => 
      updateCategorySortOrder(id, sortOrder),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-categories'] });
    },
    onError: (error) => {
      toast.error(`Failed to update sort order: ${error instanceof Error ? error.message : 'Unknown error'}`);
    },
  });

  const { mutate: batchReorderCategories } = useMutation({
    mutationFn: (categories: { id: string; sortOrder: number }[]) => 
      reorderCategories(categories),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-categories'] });
      toast.success("Categories reordered successfully");
    },
    onError: (error) => {
      toast.error(`Failed to reorder categories: ${error instanceof Error ? error.message : 'Unknown error'}`);
    },
  });

  const toggleCategoryExpansion = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const filteredCategories = categoriesData.filter((category: Category) => 
    !searchQuery || 
    category.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.iconName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const organizedCategories = organizeCategories(filteredCategories);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) {
      return;
    }

    const activeCategory = categoriesData.find((cat: Category) => cat.id === active.id);
    const overCategory = categoriesData.find((cat: Category) => cat.id === over.id);
    
    if (!activeCategory || !overCategory) {
      return;
    }

    const updatedCategories = categoriesData.map((cat: Category) => {
      if (cat.id === activeCategory.id) {
        return { ...cat, sortOrder: overCategory.sortOrder };
      }
      if (cat.id === overCategory.id) {
        return { ...cat, sortOrder: activeCategory.sortOrder };
      }
      return cat;
    });

    const sortOrderUpdates = [
      { id: activeCategory.id, sortOrder: overCategory.sortOrder },
      { id: overCategory.id, sortOrder: activeCategory.sortOrder }
    ];

    batchReorderCategories(sortOrderUpdates);
  };

  const handleCopyId = async (id: string) => {
    try {
      await navigator.clipboard.writeText(id);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
      toast.success("Category ID copied to clipboard");
    } catch (error) {
      toast.error("Failed to copy category ID");
    }
  };

  const handleSortOrderChange = (id: string, order: number) => {
    if (isNaN(order)) return;
    updateSortOrder({ id, sortOrder: order });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 text-center text-red-500">
        Error: {error instanceof Error ? error.message : 'Failed to load categories'}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Categories</CardTitle>
            </div>
            <CreateCategory onSuccess={() => queryClient.invalidateQueries({ queryKey: ['cms-categories'] })} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <Input
                placeholder="Search categories..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search categories"
              />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sortOrder">Sort Order</SelectItem>
                <SelectItem value="nameEn">Name (English)</SelectItem>
                <SelectItem value="nameAr">Name (Arabic)</SelectItem>
                <SelectItem value="createdAt">Created Date</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">
                      <div className="flex items-center space-x-1">
                        <MoveVertical className="h-4 w-4" />
                        <span>Order</span>
                      </div>
                    </TableHead>
                    <TableHead>ID</TableHead>
                    <TableHead>Name (EN)</TableHead>
                    <TableHead>Name (AR)</TableHead>
                    <TableHead>Icon</TableHead>
                    <TableHead>Parent</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead>Prompts</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <SortableContext
                    items={organizedCategories.map(cat => cat.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {organizedCategories.map((category) => (
                      <React.Fragment key={category.id}>
                        <SortableCategoryRow
                          category={category}
                          onToggleExpand={toggleCategoryExpansion}
                          isExpanded={expandedCategories.has(category.id)}
                          onCopyId={handleCopyId}
                          copiedId={copiedId}
                          onSortOrderChange={handleSortOrderChange}
                          queryClient={queryClient}
                        />
                        {expandedCategories.has(category.id) && category.children?.map((child) => (
                          <SortableCategoryRow
                            key={child.id}
                            category={child}
                            level={1}
                            onToggleExpand={toggleCategoryExpansion}
                            isExpanded={expandedCategories.has(child.id)}
                            onCopyId={handleCopyId}
                            copiedId={copiedId}
                            onSortOrderChange={handleSortOrderChange}
                            queryClient={queryClient}
                          />
                        ))}
                      </React.Fragment>
                    ))}
                  </SortableContext>
                </TableBody>
              </Table>
            </DndContext>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

type Category = {
  id: string
  nameEn: string
  nameAr: string
  icon: string
  parentId: string | null
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export type { Category }
export default CategoriesManagement;
