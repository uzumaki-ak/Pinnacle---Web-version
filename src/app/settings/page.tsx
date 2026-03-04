"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import ApiKeySettings from "@/components/ApiKeySettings";

export default function SettingsPage() {
  const [showApiKeys, setShowApiKeys] = useState(false);
  const [autoExtract, setAutoExtract] = useState(true);
  const [notifications, setNotifications] = useState(true);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Settings</h1>
        
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Preferences</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-extract">Auto Extract Content</Label>
              <Switch id="auto-extract" checked={autoExtract} onCheckedChange={setAutoExtract} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="notifications">Notifications</Label>
              <Switch id="notifications" checked={notifications} onCheckedChange={setNotifications} />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">API Keys</h2>
          <Button onClick={() => setShowApiKeys(true)}>Manage API Keys</Button>
        </Card>

        {showApiKeys && <ApiKeySettings onClose={() => setShowApiKeys(false)} />}
      </div>
    </div>
  );
}