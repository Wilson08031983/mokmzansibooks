
import React from "react";
import IntegrationCard from "./IntegrationCard";

interface Integration {
  id: string;
  name: string;
  logoSrc: string;
  connected: boolean;
  lastSynced?: string;
  autoSync?: boolean;
  apiKeyGuide?: string;
}

interface IntegrationGridProps {
  title: string;
  icon: React.ReactNode;
  integrations: Integration[];
  type: "bank" | "software";
  connecting: string | null;
  onOpenDialog: (integration: Integration, type: "bank" | "software") => void;
  onDisconnect: (id: string, type: "bank" | "software") => void;
  onSync: (id: string, type: "bank" | "software") => void;
  onToggleAutoSync: (id: string, type: "bank" | "software", newStatus: boolean) => void;
}

const IntegrationGrid: React.FC<IntegrationGridProps> = ({
  title,
  icon,
  integrations,
  type,
  connecting,
  onOpenDialog,
  onDisconnect,
  onSync,
  onToggleAutoSync
}) => {
  return (
    <div>
      <h2 className="text-xl font-medium mb-4 flex items-center">
        {icon}
        {title}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {integrations.map((integration) => (
          <IntegrationCard
            key={integration.id}
            {...integration}
            type={type}
            connecting={connecting}
            onOpenDialog={onOpenDialog}
            onDisconnect={onDisconnect}
            onSync={onSync}
            onToggleAutoSync={onToggleAutoSync}
          />
        ))}
      </div>
    </div>
  );
};

export default IntegrationGrid;
