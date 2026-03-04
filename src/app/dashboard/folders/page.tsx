"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Folder, Plus, Trash2, ArrowLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function FoldersPage() {
  const router = useRouter();
  const [folders, setFolders] = useState<string[]>([]);
  const [newFolderName, setNewFolderName] = useState("");
  const [loading, setLoading] = useState(true);
  const [itemsPerFolder, setItemsPerFolder] = useState<Record<string, number>>(
    {},
  );

  useEffect(() => {
    fetchFolders();
  }, []);

  const fetchFolders = async () => {
    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) return;

      // Get all folders
      const foldersRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/items/metadata/folders`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        },
      );

      if (foldersRes.ok) {
        const data = await foldersRes.json();
        setFolders(data.folders);

        // Get item counts per folder
        const counts: Record<string, number> = {};
        for (const folder of data.folders) {
          const itemsRes = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/v1/items?folders=${folder}`,
            {
              headers: {
                Authorization: `Bearer ${session.access_token}`,
              },
            },
          );

          if (itemsRes.ok) {
            const items = await itemsRes.json();
            counts[folder] = items.length;
          }
        }
        setItemsPerFolder(counts);
      }
    } catch (error) {
      console.error("Failed to fetch folders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    if (!folders.includes(newFolderName.trim())) {
      setFolders([...folders, newFolderName.trim()]);
      setNewFolderName("");
    }
  };

  const handleRenameFolder = async (oldName: string, newName: string) => {
    if (!newName.trim() || newName === oldName) return;

    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) return;

      // Get all items with this folder
      const itemsRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/items?folders=${oldName}`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        },
      );

      if (itemsRes.ok) {
        const items = await itemsRes.json();

        // Update each item
        for (const item of items) {
          const newFolders = item.folders.map((f: string) =>
            f === oldName ? newName.trim() : f,
          );

          await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/v1/items/${item.id}`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${session.access_token}`,
              },
              body: JSON.stringify({ folders: newFolders }),
            },
          );
        }

        // Update local state
        setFolders(folders.map((f) => (f === oldName ? newName.trim() : f)));
      }
    } catch (error) {
      console.error("Failed to rename folder:", error);
    }
  };

  const handleDeleteFolder = async (folderName: string) => {
    if (!confirm(`Delete folder "${folderName}" and unassign from all items?`))
      return;

    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) return;

      // Get all items with this folder
      const itemsRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/items?folders=${folderName}`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        },
      );

      if (itemsRes.ok) {
        const items = await itemsRes.json();

        // Remove folder from each item
        for (const item of items) {
          const newFolders = item.folders.filter(
            (f: string) => f !== folderName,
          );

          await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/v1/items/${item.id}`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${session.access_token}`,
              },
              body: JSON.stringify({ folders: newFolders }),
            },
          );
        }

        // Update local state
        setFolders(folders.filter((f) => f !== folderName));
        const newCounts = { ...itemsPerFolder };
        delete newCounts[folderName];
        setItemsPerFolder(newCounts);
      }
    } catch (error) {
      console.error("Failed to delete folder:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-primary">Manage Folders</h1>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Create New Folder */}
        <Card className="p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create New Folder
          </h2>
          <form onSubmit={handleCreateFolder} className="flex gap-3">
            <Input
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Folder name..."
              className="flex-1"
            />
            <Button type="submit" disabled={!newFolderName.trim()}>
              Create
            </Button>
          </form>
        </Card>

        {/* Folders List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : folders.length === 0 ? (
          <Card className="p-8 text-center">
            <Folder className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">
              No folders yet. Create one to organize your content!
            </p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {folders.map((folder) => (
              <Card
                key={folder}
                className="p-6 hover:shadow-lg transition-shadow cursor-pointer group"
              >
                <Link href={`/dashboard/folders/${encodeURIComponent(folder)}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <Folder className="h-6 w-6 text-primary" />
                      <div>
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                          {folder}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {itemsPerFolder[folder] || 0} items
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        {itemsPerFolder[folder] || 0}
                      </Badge>
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
