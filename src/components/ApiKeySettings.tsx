"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, EyeOff, Save } from "lucide-react";

const API_PROVIDERS = [
  { key: "groq", label: "Groq", url: "https://console.groq.com/keys" },
  { key: "google", label: "Google AI Studio", url: "https://aistudio.google.com/app/apikey" },
  { key: "euron", label: "Euron.one", url: "https://euron.one/api-keys" },
  { key: "openrouter", label: "OpenRouter", url: "https://openrouter.ai/keys" },
  { key: "mistral", label: "Mistral", url: "https://console.mistral.ai/api-keys" },
  { key: "openai", label: "OpenAI", url: "https://platform.openai.com/api-keys" },
];

export default function ApiKeySettings({ onClose }: { onClose: () => void }) {
  const [keys, setKeys] = useState<Record<string, string>>({});
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const saved = localStorage.getItem("user_api_keys");
    if (saved) {
      setKeys(JSON.parse(saved));
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem("user_api_keys", JSON.stringify(keys));
    alert("API keys saved!");
    onClose();
  };

  const toggleShow = (provider: string) => {
    setShowKeys((prev) => ({ ...prev, [provider]: !prev[provider] }));
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>API Key Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Add your own API keys for better rate limits. These are stored locally and never sent to our servers.
          </p>

          <Tabs defaultValue="llm">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="llm">LLM Providers</TabsTrigger>
              <TabsTrigger value="other">Other Services</TabsTrigger>
            </TabsList>

            <TabsContent value="llm" className="space-y-4">
              {API_PROVIDERS.map((provider) => (
                <div key={provider.key} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={provider.key}>{provider.label}</Label>
                    <a
                      href={provider.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline"
                    >
                      Get Key →
                    </a>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        id={provider.key}
                        type={showKeys[provider.key] ? "text" : "password"}
                        value={keys[provider.key] || ""}
                        onChange={(e) =>
                          setKeys((prev) => ({ ...prev, [provider.key]: e.target.value }))
                        }
                        placeholder={`Enter ${provider.label} API key`}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full"
                        onClick={() => toggleShow(provider.key)}
                      >
                        {showKeys[provider.key] ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="other" className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Additional service keys coming soon...
              </p>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Save Keys
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}