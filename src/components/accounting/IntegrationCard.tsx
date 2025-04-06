
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  CheckCircle,
  RefreshCw,
  Link,
  Link2Off,
  CreditCard,
  Building
} from "lucide-react";

interface IntegrationItem {
  id: string;
  name: string;
  logoSrc: string;
  connected: boolean;
  lastSynced?: string;
  autoSync?: boolean;
}

interface IntegrationCardProps {
  integration: IntegrationItem;
  type: "bank" | "software";
  connecting: string | null;
  onOpenDialog: (integration: IntegrationItem, type: "bank" | "software") => void;
  onDisconnect: (id: string, type: "bank" | "software") => void;
  onSync: (id: string, type: "bank" | "software", isAutoSync?: boolean) => void;
  onToggleAutoSync: (id: string, type: "bank" | "software", newStatus: boolean) => void;
}

export const formatLastSynced = (dateString?: string) => {
  if (!dateString) return "Never";
  const date = new Date(dateString);
  return date.toLocaleString();
};

const IntegrationCard = ({
  integration,
  type,
  connecting,
  onOpenDialog,
  onDisconnect,
  onSync,
  onToggleAutoSync
}: IntegrationCardProps) => {
  const icon = type === "bank" ? <CreditCard className="h-4 w-4" /> : <Building className="h-4 w-4" />;

  return (
    <Card className={`hover:shadow-md transition-shadow ${integration.connected ? 'border-green-200' : ''}`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center">
          <div className="w-8 h-8 mr-2 bg-gray-100 rounded flex items-center justify-center">
            {icon}
          </div>
          <CardTitle className="text-base">{integration.name}</CardTitle>
        </div>
        {integration.connected && <CheckCircle className="h-5 w-5 text-green-500" />}
      </CardHeader>
      <CardContent>
        {integration.connected && (
          <div className="mb-3 text-sm text-gray-500">
            <p>Last synced: {formatLastSynced(integration.lastSynced)}</p>
            <div className="flex items-center mt-2">
              <Switch
                id={`auto-sync-${integration.id}`}
                checked={integration.autoSync !== false}
                onCheckedChange={(checked) => onToggleAutoSync(integration.id, type, checked)}
              />
              <Label htmlFor={`auto-sync-${integration.id}`} className="ml-2 text-xs">
                Auto-sync every 24 hours
              </Label>
            </div>
          </div>
        )}
        <div className="flex justify-end space-x-2">
          {integration.connected ? (
            <>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onSync(integration.id, type)}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Sync
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onDisconnect(integration.id, type)}
              >
                <Link2Off className="mr-2 h-4 w-4" />
                Disconnect
              </Button>
            </>
          ) : (
            <Button 
              variant="outline" 
              size="sm"
              disabled={connecting === integration.id}
              onClick={() => onOpenDialog(integration, type)}
            >
              {connecting === integration.id ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Link className="mr-2 h-4 w-4" />
                  Connect
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default IntegrationCard;
