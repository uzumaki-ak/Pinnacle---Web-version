"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Folder, FileText, MoreVertical } from "lucide-react";
import Link from "next/link";

interface Item {
  id: string;
  title: string;
  url: string;
  type: string;
  created_at: string;
  folders: string[];
  tags: string[];
}

export default function FolderItemsPage() {
  const router = useRouter();
  const params = useParams();
  const folderName = params.name as string;
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (folderName) {
      fetchFolderItems();
    }
  }, [folderName]);

  const fetchFolderItems = async () => {
    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) return;

      const decodedFolderName = decodeURIComponent(folderName);
      const itemsRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/items?folders=${decodedFolderName}`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        },
      );

      if (itemsRes.ok) {
        const data = await itemsRes.json();
        setItems(Array.isArray(data) ? data : data.items || []);
      }
    } catch (error) {
      console.error("Failed to fetch folder items:", error);
    } finally {
      setLoading(false);
    }
  };

  const decodedFolderName = decodeURIComponent(folderName);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Folder className="h-5 w-5 text-primary" />
              <h1 className="text-2xl font-bold text-primary">
                {decodedFolderName}
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : items.length === 0 ? (
          <Card className="p-8 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">
              No items in this folder yet.
            </p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {items.map((item) => (
              <Card
                key={item.id}
                className="p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate mb-2">
                      {item.title || "Untitled"}
                    </h3>
                    <p className="text-sm text-muted-foreground truncate mb-3">
                      {item.url}
                    </p>
                    <div className="flex flex-wrap gap-2 items-center">
                      <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        {item.type || "Link"}
                      </span>
                      {item.folders && item.folders.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {item.folders.map((folder) => (
                            <span
                              key={folder}
                              className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700"
                            >
                              📁 {folder}
                            </span>
                          ))}
                        </div>
                      )}
                      {item.tags && item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {item.tags.map((tag) => (
                            <span
                              key={tag}
                              className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700"
                            >
                              🏷️ {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <Link
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="sm">
                      Open
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
