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
import { CreateCategory } from "./create-category"
import EditCategory from "./edit-category"
import { DeleteCategory } from "./delete-category"
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

export interface CategoryItem {
  id: string;
  name: string;
  nameEn: string;
  nameAr: string;
  iconName: string;
  sortOrder: number;
  parentId: string | null;
  parent?: {
    id: string;
    nameEn: string;
    nameAr: string;
  } | null;
  createdAt: string;
  updatedAt: string;
  children?: CategoryItem[];
  subcategories?: CategoryItem[];
  _count: {
    promptCategories: number;
    children: number;
    prompts?: number;
    subcategories?: number;
  };
}

async function fetchCategories() {
  const response = await fetch('/api/cms/categories');
  if (!response.ok) {
    throw new Error('Failed to fetch categories');
  }
  const data = await response.json();
  return data.data || [];
}

async function updateCategorySortOrder(id: string, sortOrder: number) {
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

async function reorderCategories(categories: { id: string; sortOrder: number }[]) {
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

function organizeCategories(categories: any[]): CategoryItem[] {
  const categoryMap = new Map<string | null, any[]>();
  
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
  
  return topLevelCategories as CategoryItem[];
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
}: { 
  category: CategoryItem; 
  level?: number; 
  onToggleExpand: (id: string) => void; 
  isExpanded: boolean; 
  onCopyId: (id: string) => void; 
  copiedId: string | null; 
  onSortOrderChange: (id: string, order: number) => void;
  queryClient: any;
  children?: React.ReactNode;
}) {
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
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-gray-600" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-600" />
              )}
            </button>
          )}
          {!hasChildren && <div className="w-6" />}
          <div className="flex items-center space-x-2">
            <div 
              {...attributes} 
              {...listeners}
              className="cursor-grab active:cursor-grabbing"
            >
              <GripVertical className="h-4 w-4 text-gray-400" />
            </div>
            <Input
              type="number"
              value={category.sortOrder}
              onChange={(e) => onSortOrderChange(category.id, parseInt(e.target.value))}
              className="w-16 h-8 text-sm"
            />
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div 
          className="flex items-center space-x-1 cursor-pointer"
          onClick={() => onCopyId(category.id)}
          title={category.id}
        >
          <span className="text-xs text-gray-600">{truncateId(category.id)}</span>
          {copiedId === category.id ? (
            <Check className="h-3.5 w-3.5 text-green-500" />
          ) : (
            <Copy className="h-3.5 w-3.5 text-gray-400" />
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

export function CategoriesManagement() {
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

  const filteredCategories = categoriesData.filter((category: any) => 
    !searchQuery || 
    category.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.iconName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const organizedCategories = React.useMemo(() => {
    return organizeCategories(filteredCategories);
  }, [filteredCategories]);

  const sortedCategories = React.useMemo(() => {
    return [...organizedCategories].sort((a, b) => {
      switch (sortBy) {
        case "sortOrder":
          return a.sortOrder - b.sortOrder;
        case "alphabetical":
          return a.nameEn.localeCompare(b.nameEn);
        case "recent":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return a.sortOrder - b.sortOrder;
      }
    });
  }, [organizedCategories, sortBy]);

  const handleSortOrderChange = (id: string, newOrder: number) => {
    updateSortOrder({ id, sortOrder: newOrder });
  };

  const copyToClipboard = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    toast.success("Category ID copied to clipboard");
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const activeIndex = sortedCategories.findIndex(cat => cat.id === active.id);
      const overIndex = sortedCategories.findIndex(cat => cat.id === over.id);
      
      if (activeIndex !== -1 && overIndex !== -1) {
        const newOrder = [...sortedCategories];
        const [movedItem] = newOrder.splice(activeIndex, 1);
        newOrder.splice(overIndex, 0, movedItem);
        
        const updates = newOrder.map((category, index) => ({
          id: category.id,
          sortOrder: index + 1,
        }));
        
        queryClient.setQueryData(['cms-categories'], (oldData: any) => {
          if (!oldData) return oldData;
          
          return oldData.map((cat: any) => {
            const update = updates.find(u => u.id === cat.id);
            if (update) {
              return { ...cat, sortOrder: update.sortOrder };
            }
            return cat;
          });
        });
        
        batchReorderCategories(updates);
      }
    }
  };

  const handleDragEndForSubcategories = (event: DragEndEvent, parentId: string) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const parentCategory = sortedCategories.find(cat => cat.id === parentId);
      
      if (parentCategory && parentCategory.children) {
        const activeIndex = parentCategory.children.findIndex(cat => cat.id === active.id);
        const overIndex = parentCategory.children.findIndex(cat => cat.id === over.id);
        
        if (activeIndex !== -1 && overIndex !== -1) {
          const newOrder = [...parentCategory.children];
          const [movedItem] = newOrder.splice(activeIndex, 1);
          newOrder.splice(overIndex, 0, movedItem);
          
          const updates = newOrder.map((category, index) => ({
            id: category.id,
            sortOrder: index + 1,
          }));
          
          queryClient.setQueryData(['cms-categories'], (oldData: any) => {
            if (!oldData) return oldData;
            
            return oldData.map((cat: any) => {
              const update = updates.find(u => u.id === cat.id);
              if (update) {
                return { ...cat, sortOrder: update.sortOrder };
              }
              return cat;
            });
          });
          
          batchReorderCategories(updates);
        }
      }
    }
  };

  const renderCategoryRow = (category: CategoryItem, level: number = 0) => {
    const isExpanded = expandedCategories.has(category.id);
    const hasChildren = category.children && category.children.length > 0;
    
    return (
      <React.Fragment key={category.id}>
        <SortableCategoryRow
          category={category}
          level={level}
          onToggleExpand={toggleCategoryExpansion}
          isExpanded={isExpanded}
          onCopyId={copyToClipboard}
          copiedId={copiedId}
          onSortOrderChange={handleSortOrderChange}
          queryClient={queryClient}
        />
        
        {isExpanded && hasChildren && (
          <>
            {category.children!.map(child => {
              return renderCategoryRow(child, level + 1);
            })}
          </>
        )}
      </React.Fragment>
    );
  };

  return (
    <Card className="w-full shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-2xl font-bold">Categories Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2 w-2/3">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="text"
                placeholder="Search categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-full"
              />
            </div>
            <Select
              value={sortBy}
              onValueChange={setSortBy}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sortOrder">Sort Order</SelectItem>
                <SelectItem value="alphabetical">A-Z</SelectItem>
                <SelectItem value="recent">Recently Added</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <CreateCategory onSuccess={() => queryClient.invalidateQueries({ queryKey: ['cms-categories'] })} />
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-24">Sort Order</TableHead>
                <TableHead className="w-28">id</TableHead>
                <TableHead>nameEn</TableHead>
                <TableHead>nameAr</TableHead>
                <TableHead>iconName</TableHead>
                <TableHead>Parent</TableHead>
                <TableHead>createdAt</TableHead>
                <TableHead>updatedAt</TableHead>
                <TableHead>Prompts</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-10">
                    <div className="flex justify-center items-center">
                      <Spinner className="mr-2" /> Loading categories...
                    </div>
                  </TableCell>
                </TableRow>
              ) : isError ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-10 text-red-500">
                    Error loading categories: {error instanceof Error ? error.message : 'Unknown error'}
                  </TableCell>
                </TableRow>
              ) : sortedCategories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-10">
                    No categories found
                  </TableCell>
                </TableRow>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={sortedCategories.map(cat => cat.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {sortedCategories.map(category => renderCategoryRow(category))}
                  </SortableContext>
                </DndContext>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

export default CategoriesManagement;
