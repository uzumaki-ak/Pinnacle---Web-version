"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Autocomplete from "@/components/Autocomplete";
import { Folder, Tag, Plus, ArrowLeft } from "lucide-react";

export default function SaveContentPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [mediaType, setMediaType] = useState("link");
  const [folders, setFolders] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [note, setNote] = useState("");

  const [availableFolders, setAvailableFolders] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAvailableMetadata();
  }, []);

  const fetchAvailableMetadata = async () => {
    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) return;

      // Fetch available folders
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
        setAvailableFolders(data.folders);
      }

      // Fetch available tags
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
        setAvailableTags(data.tags);
      }
    } catch (error) {
      console.error("Failed to fetch metadata:", error);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/auth/login");
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/items`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            title: title || url,
            url,
            media_type: mediaType,
            folders,
            tags,
            note,
            extract_content: true,
            auto_transcribe: true,
            auto_ocr: true,
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to save item");
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setTitle("");
        setUrl("");
        setMediaType("link");
        setFolders([]);
        setTags([]);
        setNote("");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to save item");
    } finally {
      setLoading(false);
    }
  };

  const MEDIA_TYPES = [
    { value: "link", label: "Link" },
    { value: "article", label: "Article" },
    { value: "video", label: "Video" },
    { value: "audio", label: "Audio" },
    { value: "image", label: "Image" },
    { value: "youtube", label: "YouTube" },
    { value: "pdf", label: "PDF" },
    { value: "other", label: "Other" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-primary">Save Content</h1>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        <Card className="p-8">
          <form onSubmit={handleSave} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">
                Title
              </label>
              <Input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Content title (optional)..."
                className="text-base"
              />
            </div>

            {/* URL */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">
                URL
              </label>
              <Input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://..."
                required
                className="text-base"
              />
            </div>

            {/* Media Type */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">
                Content Type
              </label>
              <select
                value={mediaType}
                onChange={(e) => setMediaType(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {MEDIA_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Folders with Autocomplete */}
            <Autocomplete
              label="Folders"
              placeholder="Add a folder..."
              suggestions={availableFolders}
              selected={folders}
              onSelect={(folder) => {
                if (!folders.includes(folder)) {
                  setFolders([...folders, folder]);
                }
              }}
              onRemove={(folder) =>
                setFolders(folders.filter((f) => f !== folder))
              }
              icon={<Folder className="h-4 w-4" />}
            />

            {/* Tags with Autocomplete */}
            <Autocomplete
              label="Tags"
              placeholder="Add a tag..."
              suggestions={availableTags}
              selected={tags}
              onSelect={(tag) => {
                if (!tags.includes(tag)) {
                  setTags([...tags, tag]);
                }
              }}
              onRemove={(tag) => setTags(tags.filter((t) => t !== tag))}
              icon={<Tag className="h-4 w-4" />}
            />

            {/* Note */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">
                Note
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a note or highlight..."
                rows={4}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 rounded-lg bg-destructive/10 text-destructive text-sm">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading || !url}
              className="w-full text-base"
              size="lg"
            >
              {loading ? "Saving..." : success ? "Saved! ✓" : "Save to Vault"}
            </Button>
          </form>
        </Card>
      </main>
    </div>
  );
}
