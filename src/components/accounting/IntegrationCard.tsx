
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { 
  Building, 
  Link, 
  RefreshCw,
  CheckCircle,
  Link2Off,
  Clock
} from "lucide-react";

interface IntegrationCardProps {
  id: string;
  name: string;
  logoSrc: string;
  connected: boolean;
  lastSynced?: string;
  autoSync?: boolean;
  connecting?: string | null;
  type: "bank" | "software";
  onOpenDialog: (integration: any, type: "bank" | "software") => void;
  onDisconnect: (id: string, type: "bank" | "software") => void;
  onSync: (id: string, type: "bank" | "software") => void;
  onToggleAutoSync: (id: string, type: "bank" | "software", newStatus: boolean) => void;
}

export const formatLastSynced = (lastSyncedDate?: string) => {
  if (!lastSyncedDate) return "Never";
  
  const date = new Date(lastSyncedDate);
  const now = new Date();
  
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return "Just now";
  if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return "Yesterday";
  if (diffInDays < 7) return `${diffInDays} days ago`;
  
  return date.toLocaleDateString();
};

const IntegrationCard: React.FC<IntegrationCardProps> = ({
  id,
  name,
  logoSrc,
  connected,
  lastSynced,
  autoSync,
  connecting,
  type,
  onOpenDialog,
  onDisconnect,
  onSync,
  onToggleAutoSync
}) => {
  const isConnecting = connecting === id;
  
  return (
    <Card className={`${connected ? 'border-primary' : 'border-dashed border-gray-300'}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {name}
        </CardTitle>
        <div className="h-8 w-8 bg-gray-100 rounded-full overflow-hidden">
          {logoSrc ? (
            <img src={logoSrc} alt={name} className="h-full w-full object-cover" />
          ) : (
            <Building className="h-4 w-4 m-2 text-gray-400" />
          )}
        </div>
      </CardHeader>
      <CardContent>
        {connected ? (
          <div className="space-y-4">
            <div className="flex items-center">
              <span className="inline-flex items-center text-xs font-medium text-green-600">
                <CheckCircle className="mr-1 h-3 w-3" /> Connected
              </span>
              <span className="text-xs text-gray-500 ml-auto flex items-center">
                <Clock className="mr-1 h-3 w-3" /> 
                {formatLastSynced(lastSynced)}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Auto-Sync</span>
              <Switch 
                checked={autoSync !== false}
                onCheckedChange={(checked) => onToggleAutoSync(id, type, checked)}
                className="scale-75 origin-right" 
              />
            </div>
            
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => onSync(id, type)}
              >
                <RefreshCw className="mr-1 h-3 w-3" />
                Sync
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => onDisconnect(id, type)}
              >
                <Link2Off className="mr-1 h-3 w-3" />
                Disconnect
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-gray-500">
              {type === "bank" 
                ? "Connect your bank account to import transactions automatically" 
                : "Connect to synchronize your financial data"}
            </p>
            
            <Button
              variant="default"
              size="sm"
              className="w-full"
              disabled={isConnecting}
              onClick={() => onOpenDialog({ id, name, logoSrc, connected, lastSynced, autoSync }, type)}
            >
              {isConnecting ? (
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
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default IntegrationCard;
