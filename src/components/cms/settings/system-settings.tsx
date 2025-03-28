"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/use-toast";
import { AlertCircle, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

/**
 * System Settings component for the CMS
 * Allows admins to configure global system settings
 */
export function SystemSettings() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [settings, setSettings] = useState({
    showProToAll: false,
  });

  // Fetch current settings
  useEffect(() => {
    async function fetchSettings() {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch("/api/cms/settings");
        if (response.ok) {
          const data = await response.json();
          setSettings({
            showProToAll: data.showProToAll === "true",
          });
        } else {
          throw new Error("Failed to fetch settings");
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
        setError("Failed to load system settings. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchSettings();
  }, []);

  // Save settings
  const saveSettings = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      
      const response = await fetch("/api/cms/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          showProToAll: settings.showProToAll,
        }),
      });

      if (response.ok) {
        setSuccess("Settings updated successfully");
        toast({
          title: "Success",
          description: "System settings updated successfully",
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save settings");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      setError(error instanceof Error ? error.message : "Failed to save system settings");
      toast({
        title: "Error",
        description: "Failed to save system settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Content Access Settings</CardTitle>
        <CardDescription>
          Configure how users access content on the platform
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <div className="flex items-center justify-between space-x-2">
          <div>
            <Label htmlFor="show-pro-toggle" className="font-medium">
              Show PRO prompts to all users
            </Label>
            <p className="text-sm text-muted-foreground mt-1">
              When enabled, all users (including unsubscribed users) will see the full content of PRO prompts.
              When disabled, only subscribers will see the full content of PRO prompts.
            </p>
          </div>
          <Switch
            id="show-pro-toggle"
            checked={settings.showProToAll}
            onCheckedChange={(checked) => setSettings({ ...settings, showProToAll: checked })}
          />
        </div>

        <div className="border-t pt-4">
          <Button onClick={saveSettings} disabled={saving}>
            {saving && <Spinner className="mr-2 h-4 w-4" />}
            Save Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
