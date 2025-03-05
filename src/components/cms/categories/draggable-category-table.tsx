"use client";

import React, { useState, Fragment } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  ChevronDown, 
  ChevronRight, 
  Edit, 
  Trash2,
  MoveVertical,
  Save
} from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

type Category = {
  id: string;
  name: string;
  nameEn?: string;
  nameAr: string;
  iconName: string;
  slug?: string;
  description?: string;
  parentId: string | null;
  sortOrder?: number;
  order?: number;
  createdAt: string;
  updatedAt: string;
  children?: Category[];
  subcategories?: Category[];
  _count: {
    promptCategories: number;
    children: number;
    prompts?: number;
    subcategories?: number;
  };
};

type DraggableCategoryTableProps = {
  categories: Category[];
  expandedCategories: Set<string>;
  toggleExpand: (categoryId: string) => void;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  onDragEnd: (result: any) => void;
  hasOrderChanged: boolean;
  saveOrder: () => void;
};

function DraggableCategoryTable({
  categories,
  expandedCategories,
  toggleExpand,
  onEdit,
  onDelete,
  onDragEnd,
  hasOrderChanged,
  saveOrder
}: DraggableCategoryTableProps) {
  const [isDragging, setIsDragging] = useState(false);

  const renderCategoryRow = (category: Category, level = 0, index: number) => {
    const isExpanded = expandedCategories.has(category.id);
    const hasChildren = category.children && category.children.length > 0;
    
    // Create a fragment to hold the row and its children
    const rowContent = (
      <>
        <Draggable key={category.id} draggableId={category.id} index={index}>
          {(provided, snapshot) => (
            <TableRow
              ref={provided.innerRef}
              {...provided.draggableProps}
              className={snapshot.isDragging ? "bg-accent opacity-70" : ""}
            >
              <TableCell className="w-10">
                {hasChildren ? (
                  <button
                    onClick={() => toggleExpand(category.id)}
                    className="mr-2 p-1 rounded-sm hover:bg-gray-100"
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                ) : (
                  <span>&nbsp;</span>
                )}
              </TableCell>
              <TableCell className="w-10">
                <div {...provided.dragHandleProps} className="mr-2 cursor-move">
                  <MoveVertical className="h-4 w-4 text-gray-400" />
                </div>
              </TableCell>
              <TableCell className="font-medium">
                <div className="flex items-center">
                  <div style={{ width: `${level * 20}px` }} />
                  <span>{category.name}</span>
                </div>
              </TableCell>
              <TableCell>{category.nameAr}</TableCell>
              <TableCell>{category.iconName}</TableCell>
              <TableCell>{category.order}</TableCell>
              <TableCell>{category._count?.prompts || 0}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(category)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(category)}
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          )}
        </Draggable>
        
        {/* Render children if expanded */}
        {isExpanded && hasChildren && category.children && 
          category.children
            .sort((a, b) => (a.order || 0) - (b.order || 0))
            .map((child, childIndex) => (
              <Fragment key={child.id}>
                {renderCategoryRow(
                  child, 
                  level + 1, 
                  index + childIndex + 1
                )}
              </Fragment>
            ))
        }
      </>
    );
    
    return rowContent;
  };

  return (
    <div className="rounded-md border">
      {hasOrderChanged && (
        <div className="bg-yellow-50 p-2 flex justify-between items-center">
          <p className="text-sm text-yellow-800">
            Category order has been changed. Click Save to persist changes.
          </p>
          <Button onClick={saveOrder} size="sm" className="bg-yellow-600 hover:bg-yellow-700">
            <Save className="mr-2 h-4 w-4" />
            Save Order
          </Button>
        </div>
      )}
      
      <DragDropContext 
        onDragStart={() => setIsDragging(true)}
        onDragEnd={(result) => {
          setIsDragging(false);
          onDragEnd(result);
        }}
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">&nbsp;</TableHead>
              <TableHead className="w-10">&nbsp;</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Arabic Name</TableHead>
              <TableHead>Icon</TableHead>
              <TableHead>Sort Order</TableHead>
              <TableHead>Prompts</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <Droppable droppableId="categories" type="category">
            {(provided) => (
              <TableBody
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {categories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      No categories found
                    </TableCell>
                  </TableRow>
                ) : (
                  categories.map((category, index) => renderCategoryRow(category, 0, index))
                )}
                {provided.placeholder}
              </TableBody>
            )}
          </Droppable>
        </Table>
      </DragDropContext>
    </div>
  );
}

export default DraggableCategoryTable;
