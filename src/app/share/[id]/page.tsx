"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";

export default function SharePage() {
  const params = useParams();
  const idParam = params?.id;
  const shareId = Array.isArray(idParam) ? idParam[0] : idParam;
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (shareId) {
      fetchSharedItem(shareId);
    }
  }, [shareId]);

  const fetchSharedItem = async (id: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/share/${id}`,
      );
      const data = await response.json();
      setItem(data);
    } catch (error) {
      console.error("Failed to fetch shared item:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
  if (!item) return <div className="min-h-screen flex items-center justify-center"><p>Item not found</p></div>;

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-3xl mx-auto">
        <Card className="p-8">
          <div className="flex items-start justify-between mb-4">
            <h1 className="text-3xl font-bold">{item.title}</h1>
            <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              <ExternalLink className="h-5 w-5" />
            </a>
          </div>
          {item.thumbnail_url && <img src={item.thumbnail_url} alt={item.title} className="w-full h-64 object-cover rounded-lg mb-4" />}
          <p className="text-muted-foreground mb-4">{item.content_snippet}</p>
          <div className="flex gap-2 flex-wrap">
            {item.tags?.map((tag: string) => <Badge key={tag}>#{tag}</Badge>)}
          </div>
        </Card>
      </div>
    </div>
  );
}
