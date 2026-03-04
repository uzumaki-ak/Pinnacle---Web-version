"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import ChatBot from "@/components/ChatBot";
import ItemGrid from "@/components/ItemGrid";
import FilterBar from "@/components/FilterBar";
import ApiKeySettings from "@/components/ApiKeySettings";
import {
  Settings,
  LogOut,
  Plus,
  Search,
  MessageSquare,
  Grid3x3,
  Moon,
  Sun,
  Folder,
  Tag,
} from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";

export default function Dashboard() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [user, setUser] = useState<any>(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("items");
  const [showSettings, setShowSettings] = useState(false);
  const [filters, setFilters] = useState<any>({});

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (!user) return;
    fetchItems();
  }, [user, filters, searchQuery]);

  const checkUser = async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/auth/login");
      return;
    }

    setUser(user);
  };

  const fetchItems = async () => {
    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) return;

      // Build query params with filters
      const params = new URLSearchParams();
      params.append("limit", "50");

      if (filters.media_types) {
        params.append("media_types", filters.media_types);
      }
      if (filters.folders) {
        params.append("folders", filters.folders);
      }
      if (filters.tags) {
        params.append("tags", filters.tags);
      }
      if (searchQuery) {
        params.append("search", searchQuery);
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/items?${params}`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        setItems(data);
      }
    } catch (error) {
      console.error("Failed to fetch items:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  const handleFilterChange = useCallback((newFilters: any) => {
    setFilters(newFilters);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-primary">Content Vault</h1>
            <Badge variant="secondary" className="hidden md:block">
              {items.length} items saved
            </Badge>
          </div>

          <div className="flex items-center gap-3">
            {/* Folders */}
            <Link href="/dashboard/folders">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
                title="Manage folders"
              >
                <Folder className="h-5 w-5" />
              </Button>
            </Link>

            {/* Tags */}
            <Link href="/dashboard/tags">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
                title="Manage tags"
              >
                <Tag className="h-5 w-5" />
              </Button>
            </Link>

            {/* Add Item Button */}
            <Link href="/dashboard/save">
              <Button
                size="icon"
                className="rounded-full"
                title="Save new content"
              >
                <Plus className="h-5 w-5" />
              </Button>
            </Link>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-full"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>

            {/* Settings */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSettings(true)}
              className="rounded-full"
            >
              <Settings className="h-5 w-5" />
            </Button>

            {/* Sign Out */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSignOut}
              className="rounded-full"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search your saved content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 rounded-2xl"
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 rounded-2xl">
            <TabsTrigger value="items" className="rounded-xl">
              <Grid3x3 className="h-4 w-4 mr-2" />
              Items
            </TabsTrigger>
            <TabsTrigger value="chat" className="rounded-xl">
              <MessageSquare className="h-4 w-4 mr-2" />
              Chat
            </TabsTrigger>
          </TabsList>

          {/* Items Tab */}
          <TabsContent value="items" className="space-y-6">
            <FilterBar onFilterChange={handleFilterChange} />
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : (
              <ItemGrid items={items} onRefresh={fetchItems} />
            )}
          </TabsContent>

          {/* Chat Tab */}
          <TabsContent value="chat">
            <div className="max-w-4xl mx-auto">
              <ChatBot />
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* API Key Settings Modal */}
      {showSettings && (
        <ApiKeySettings onClose={() => setShowSettings(false)} />
      )}
    </div>
  );
}
