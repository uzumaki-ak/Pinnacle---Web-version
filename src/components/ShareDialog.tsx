"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Share2 } from "lucide-react";

export default function ShareDialog({ itemId, onClose }: any) {
  const [shareUrl, setShareUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const generateLink = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/share/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item_id: itemId, is_public: true }),
      });
      const data = await response.json();
      setShareUrl(data.share_url);
    } catch (error) {
      console.error("Failed to generate share link:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    alert("Link copied!");
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share Item</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {!shareUrl ? (
            <Button onClick={generateLink} disabled={loading} className="w-full">
              <Share2 className="h-4 w-4 mr-2" />
              {loading ? "Generating..." : "Generate Share Link"}
            </Button>
          ) : (
            <>
              <Input value={shareUrl} readOnly />
              <Button onClick={copyToClipboard} className="w-full">
                <Copy className="h-4 w-4 mr-2" />
                Copy Link
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}