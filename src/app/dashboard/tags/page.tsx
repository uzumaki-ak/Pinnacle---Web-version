"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tag, Plus, Trash2, ArrowLeft } from "lucide-react";

export default function TagsPage() {
  const router = useRouter();
  const [tags, setTags] = useState<string[]>([]);
  const [newTagName, setNewTagName] = useState("");
  const [loading, setLoading] = useState(true);
  const [itemsPerTag, setItemsPerTag] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) return;

      // Get all tags
      const tagsRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/items/metadata/tags`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        },
      );

      if (tagsRes.ok) {
        const data = await tagsRes.json();
        setTags(data.tags);

        // Get item counts per tag
        const counts: Record<string, number> = {};
        for (const tag of data.tags) {
          const itemsRes = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/v1/items?tags=${tag}`,
            {
              headers: {
                Authorization: `Bearer ${session.access_token}`,
              },
            },
          );

          if (itemsRes.ok) {
            const items = await itemsRes.json();
            counts[tag] = items.length;
          }
        }
        setItemsPerTag(counts);
      }
    } catch (error) {
      console.error("Failed to fetch tags:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;

    if (!tags.includes(newTagName.trim())) {
      setTags([...tags, newTagName.trim()]);
      setNewTagName("");
    }
  };

  const handleRenameTag = async (oldName: string, newName: string) => {
    if (!newName.trim() || newName === oldName) return;

    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) return;

      // Get all items with this tag
      const itemsRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/items?tags=${oldName}`,
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
          const newTags = item.tags.map((t: string) =>
            t === oldName ? newName.trim() : t,
          );

          await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/v1/items/${item.id}`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${session.access_token}`,
              },
              body: JSON.stringify({ tags: newTags }),
            },
          );
        }

        // Update local state
        setTags(tags.map((t) => (t === oldName ? newName.trim() : t)));
      }
    } catch (error) {
      console.error("Failed to rename tag:", error);
    }
  };

  const handleDeleteTag = async (tagName: string) => {
    if (!confirm(`Delete tag "${tagName}" and unassign from all items?`))
      return;

    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) return;

      // Get all items with this tag
      const itemsRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/items?tags=${tagName}`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        },
      );

      if (itemsRes.ok) {
        const items = await itemsRes.json();

        // Remove tag from each item
        for (const item of items) {
          const newTags = item.tags.filter((t: string) => t !== tagName);

          await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/v1/items/${item.id}`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${session.access_token}`,
              },
              body: JSON.stringify({ tags: newTags }),
            },
          );
        }

        // Update local state
        setTags(tags.filter((t) => t !== tagName));
        const newCounts = { ...itemsPerTag };
        delete newCounts[tagName];
        setItemsPerTag(newCounts);
      }
    } catch (error) {
      console.error("Failed to delete tag:", error);
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
          <h1 className="text-2xl font-bold text-primary">Manage Tags</h1>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Create New Tag */}
        <Card className="p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create New Tag
          </h2>
          <form onSubmit={handleCreateTag} className="flex gap-3">
            <Input
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              placeholder="Tag name (without #)..."
              className="flex-1"
            />
            <Button type="submit" disabled={!newTagName.trim()}>
              Create
            </Button>
          </form>
        </Card>

        {/* Tags List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : tags.length === 0 ? (
          <Card className="p-8 text-center">
            <Tag className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">
              No tags yet. Create one to organize your content!
            </p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {tags.map((tag) => (
              <Card key={tag} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <Tag className="h-6 w-6 text-primary" />
                    <div>
                      <h3 className="font-semibold text-foreground">#{tag}</h3>
                      <p className="text-sm text-muted-foreground">
                        {itemsPerTag[tag] || 0} items
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{itemsPerTag[tag] || 0}</Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteTag(tag)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
