"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Trash2, Edit, Folder, Tag, MoreVertical } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ItemGrid({ items, onRefresh }: any) {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  const handleDelete = async (id: string) => {
    if (confirm("Delete this item?")) {
      // TODO: Call delete API
      onRefresh();
    }
  };

  const getMediaTypeColor = (type: string) => {
    const colors: any = {
      article: "bg-blue-500",
      video: "bg-red-500",
      youtube: "bg-red-600",
      image: "bg-purple-500",
      audio: "bg-green-500",
      link: "bg-gray-500",
    };
    return colors[type] || "bg-gray-400";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((item: any) => (
        <Card
          key={item.id}
          className="p-4 hover:shadow-lg transition-shadow cursor-pointer group"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {item.favicon_url && (
                <img
                  src={item.favicon_url}
                  alt=""
                  className="w-4 h-4 flex-shrink-0"
                />
              )}
              <h3 className="font-semibold text-sm truncate">{item.title}</h3>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => window.open(item.url, "_blank")}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleDelete(item.id)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Thumbnail */}
          {item.thumbnail_url && (
            <div className="w-full h-32 mb-3 rounded-lg overflow-hidden bg-muted">
              <img
                src={item.thumbnail_url}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Description */}
          {item.content_snippet && (
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {item.content_snippet}
            </p>
          )}

          {/* Folders */}
          {item.folders && item.folders.length > 0 && (
            <div className="flex items-center gap-1 mb-2 flex-wrap">
              <Folder className="h-3 w-3 text-muted-foreground" />
              {item.folders.map((folder: string) => (
                <Badge key={folder} variant="outline" className="text-xs">
                  {folder}
                </Badge>
              ))}
            </div>
          )}

          {/* Tags */}
          {item.tags && item.tags.length > 0 && (
            <div className="flex items-center gap-1 mb-3 flex-wrap">
              <Tag className="h-3 w-3 text-muted-foreground" />
              {item.tags.map((tag: string) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${getMediaTypeColor(item.media_type)}`} />
              <span className="capitalize">{item.media_type}</span>
            </div>
            <span>{formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}</span>
          </div>
        </Card>
      ))}
    </div>
  );
}