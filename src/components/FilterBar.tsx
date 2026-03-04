"use client";

import { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, Filter } from "lucide-react";

const MEDIA_TYPES = [
  "all",
  "article",
  "video",
  "youtube",
  "image",
  "audio",
  "link",
];

export default function FilterBar({
  onFilterChange,
}: {
  onFilterChange: (filters: any) => void;
}) {
  const [selectedTypes, setSelectedTypes] = useState<string[]>(["all"]);
  const [selectedFolders, setSelectedFolders] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Call onFilterChange whenever filters change
  useEffect(() => {
    const filters: any = {};

    if (!selectedTypes.includes("all") && selectedTypes.length > 0) {
      filters.media_types = selectedTypes.join(",");
    }

    if (selectedFolders.length > 0) {
      filters.folders = selectedFolders.join(",");
    }

    if (selectedTags.length > 0) {
      filters.tags = selectedTags.join(",");
    }

    onFilterChange(filters);
  }, [selectedTypes, selectedFolders, selectedTags]);

  const toggleType = (type: string) => {
    if (type === "all") {
      setSelectedTypes(["all"]);
    } else {
      const newTypes = selectedTypes.filter((t) => t !== "all");
      if (selectedTypes.includes(type)) {
        const filtered = newTypes.filter((t) => t !== type);
        setSelectedTypes(filtered.length === 0 ? ["all"] : filtered);
      } else {
        setSelectedTypes([...newTypes, type]);
      }
    }
  };

  const clearFilters = () => {
    setSelectedTypes(["all"]);
    setSelectedFolders([]);
    setSelectedTags([]);
  };

  return (
    <div className="space-y-4 p-4 bg-card rounded-2xl border border-border">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-semibold text-sm">Filters</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="h-8"
        >
          Clear
        </Button>
      </div>

      {/* Media Types */}
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-2">Type</p>
        <div className="flex flex-wrap gap-2">
          {MEDIA_TYPES.map((type) => (
            <Badge
              key={type}
              variant={selectedTypes.includes(type) ? "default" : "outline"}
              className="cursor-pointer capitalize"
              onClick={() => toggleType(type)}
            >
              {type}
            </Badge>
          ))}
        </div>
      </div>

      {/* Active Filters */}
      {(selectedFolders.length > 0 ||
        selectedTags.length > 0 ||
        !selectedTypes.includes("all")) && (
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">
            Active
          </p>
          <div className="flex flex-wrap gap-2">
            {!selectedTypes.includes("all") &&
              selectedTypes.map((type) => (
                <Badge key={type} variant="secondary" className="gap-1">
                  {type}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => toggleType(type)}
                  />
                </Badge>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
