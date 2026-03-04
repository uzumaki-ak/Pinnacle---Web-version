"use client";

import { Button } from "@/components/ui/button";
import { Trash2, Tag, FolderOpen } from "lucide-react";

export default function BulkActions({ selectedIds, onAction }: any) {
  return (
    <div className="flex items-center gap-2 p-3 bg-card border rounded-lg">
      <span className="text-sm font-medium">{selectedIds.length} selected</span>
      <div className="flex gap-2 ml-auto">
        <Button size="sm" variant="outline" onClick={() => onAction("tag")}>
          <Tag className="h-4 w-4 mr-2" />
          Add Tag
        </Button>
        <Button size="sm" variant="outline" onClick={() => onAction("move")}>
          <FolderOpen className="h-4 w-4 mr-2" />
          Move
        </Button>
        <Button size="sm" variant="destructive" onClick={() => onAction("delete")}>
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </Button>
      </div>
    </div>
  );
}