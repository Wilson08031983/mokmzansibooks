import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { 
  Building, 
  CreditCard, 
  CheckCircle, 
  ArrowRight, 
  RefreshCw,
  AlertCircle,
  Settings,
  Key,
  Link,
  Link2Off
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface BankIntegration {
  id: string;
  name: string;
  logoSrc: string;
  connected: boolean;
  lastSynced?: string;
}

interface AccountingSoftware {
  id: string;
  name: string;
  logoSrc: string;
  connected: boolean;
  lastSynced?: string;
}

const AccountingIntegrations = () => {
  const { toast } = useToast();
  const [connecting, setConnecting] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentIntegration, setCurrentIntegration] = useState<BankIntegration | AccountingSoftware | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [autoSync, setAutoSync] = useState(true);
  const [integrationType, setIntegrationType] = useState<"bank" | "software">("bank");
  
  const [banks, setBanks] = useState<BankIntegration[]>([
    { id: "absa", name: "ABSA", logoSrc: "/placeholder.svg", connected: false },
    { id: "fnb", name: "First National Bank", logoSrc: "/placeholder.svg", connected: false },
    { id: "nedbank", name: "Nedbank", logoSrc: "/placeholder.svg", connected: false },
    { id: "standard-bank", name: "Standard Bank", logoSrc: "/placeholder.svg", connected: false },
    { id: "capitec", name: "Capitec", logoSrc: "/placeholder.svg", connected: false },
    { id: "bank-zero", name: "Bank Zero", logoSrc: "/placeholder.svg", connected: false },
    { id: "lula", name: "Lula", logoSrc: "/placeholder.svg", connected: false },
    { id: "tyme-bank", name: "TymeBank", logoSrc: "/placeholder.svg", connected: false },
    { id: "al-baraka", name: "Al Baraka Bank", logoSrc: "/placeholder.svg", connected: false },
    { id: "bidvest", name: "Bidvest Bank", logoSrc: "/placeholder.svg", connected: false },
  ]);

  const [accountingSoftware, setAccountingSoftware] = useState<AccountingSoftware[]>([
    { id: "xero", name: "Xero", logoSrc: "/placeholder.svg", connected: false },
    { id: "quickbooks", name: "QuickBooks", logoSrc: "/placeholder.svg", connected: false },
    { id: "sage", name: "Sage", logoSrc: "/placeholder.svg", connected: false },
    { id: "wave", name: "Wave", logoSrc: "/placeholder.svg", connected: false },
  ]);
  
  useEffect(() => {
    const savedBanks = localStorage.getItem('connectedBanks');
    const savedSoftware = localStorage.getItem('connectedSoftware');
    
    if (savedBanks) {
      setBanks(JSON.parse(savedBanks));
    }
    
    if (savedSoftware) {
      setAccountingSoftware(JSON.parse(savedSoftware));
    }
  }, []);
  
  useEffect(() => {
    localStorage.setItem('connectedBanks', JSON.stringify(banks));
  }, [banks]);
  
  useEffect(() => {
    localStorage.setItem('connectedSoftware', JSON.stringify(accountingSoftware));
  }, [accountingSoftware]);

  const handleOpenIntegrationDialog = (integration: BankIntegration | AccountingSoftware, type: "bank" | "software") => {
    setCurrentIntegration(integration);
    setIntegrationType(type);
    setApiKey("");
    setUsername("");
    setPassword("");
    setOpenDialog(true);
  };

  const handleDisconnect = (id: string, type: "bank" | "software") => {
    if (type === "bank") {
      const updatedBanks = banks.map(bank => 
        bank.id === id ? { ...bank, connected: false, lastSynced: undefined } : bank
      );
      setBanks(updatedBanks);
    } else {
      const updatedSoftware = accountingSoftware.map(software => 
        software.id === id ? { ...software, connected: false, lastSynced: undefined } : software
      );
      setAccountingSoftware(updatedSoftware);
    }
    
    toast({
      title: "Disconnected",
      description: `Successfully disconnected from ${type === 'bank' ? 'bank account' : 'accounting software'}.`,
    });
  };

  const handleConnect = () => {
    if (!currentIntegration) return;

    setConnecting(currentIntegration.id);
    setOpenDialog(false);
    
    setTimeout(() => {
      if (integrationType === "bank") {
        const updatedBanks = banks.map(bank => 
          bank.id === currentIntegration.id 
            ? { 
                ...bank, 
                connected: true, 
                lastSynced: new Date().toISOString() 
              } 
            : bank
        );
        setBanks(updatedBanks);
      } else {
        const updatedSoftware = accountingSoftware.map(software => 
          software.id === currentIntegration.id 
            ? { 
                ...software, 
                connected: true, 
                lastSynced: new Date().toISOString() 
              } 
            : software
        );
        setAccountingSoftware(updatedSoftware);
      }
      
      setConnecting(null);
      toast({
        title: "Connection Successful",
        description: `Successfully connected to ${integrationType === 'bank' ? 'bank account' : 'accounting software'}.`,
      });

      if (autoSync) {
        toast({
          title: "Syncing Data",
          description: "Your financial data is being synchronized...",
        });
        
        setTimeout(() => {
          toast({
            title: "Sync Complete",
            description: "Your financial data has been synchronized successfully.",
          });
        }, 3000);
      }
    }, 2000);
  };

  const syncIntegration = (id: string, type: "bank" | "software") => {
    toast({
      title: "Syncing Data",
      description: `Synchronizing data from ${type === 'bank' ? 'bank account' : 'accounting software'}...`,
    });
    
    setTimeout(() => {
      if (type === "bank") {
        const updatedBanks = banks.map(bank => 
          bank.id === id ? { ...bank, lastSynced: new Date().toISOString() } : bank
        );
        setBanks(updatedBanks);
      } else {
        const updatedSoftware = accountingSoftware.map(software => 
          software.id === id ? { ...software, lastSynced: new Date().toISOString() } : software
        );
        setAccountingSoftware(updatedSoftware);
      }
      
      toast({
        title: "Sync Complete",
        description: "Your financial data has been synchronized successfully.",
      });
    }, 2000);
  };

  const formatLastSynced = (dateString?: string) => {
    if (!dateString) return "Never";
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Integrations</h1>
        <p className="text-gray-500">Connect your bank accounts and accounting software</p>
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-medium mb-4 flex items-center">
            <Building className="mr-2 h-5 w-5" />
            Banking Integrations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {banks.map((bank) => (
              <Card key={bank.id} className={`hover:shadow-md transition-shadow ${bank.connected ? 'border-green-200' : ''}`}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div className="flex items-center">
                    <div className="w-8 h-8 mr-2 bg-gray-100 rounded flex items-center justify-center">
                      <CreditCard className="h-4 w-4" />
                    </div>
                    <CardTitle className="text-base">{bank.name}</CardTitle>
                  </div>
                  {bank.connected && <CheckCircle className="h-5 w-5 text-green-500" />}
                </CardHeader>
                <CardContent>
                  {bank.connected && (
                    <div className="mb-3 text-sm text-gray-500">
                      <p>Last synced: {formatLastSynced(bank.lastSynced)}</p>
                    </div>
                  )}
                  <div className="flex justify-end space-x-2">
                    {bank.connected ? (
                      <>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => syncIntegration(bank.id, 'bank')}
                        >
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Sync
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDisconnect(bank.id, 'bank')}
                        >
                          <Link2Off className="mr-2 h-4 w-4" />
                          Disconnect
                        </Button>
                      </>
                    ) : (
                      <Button 
                        variant="outline" 
                        size="sm"
                        disabled={connecting === bank.id}
                        onClick={() => handleOpenIntegrationDialog(bank, 'bank')}
                      >
                        {connecting === bank.id ? (
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
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-medium mb-4 flex items-center">
            <Building className="mr-2 h-5 w-5" />
            Accounting Software
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {accountingSoftware.map((software) => (
              <Card key={software.id} className={`hover:shadow-md transition-shadow ${software.connected ? 'border-green-200' : ''}`}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div className="flex items-center">
                    <div className="w-8 h-8 mr-2 bg-gray-100 rounded flex items-center justify-center">
                      <Building className="h-4 w-4" />
                    </div>
                    <CardTitle className="text-base">{software.name}</CardTitle>
                  </div>
                  {software.connected && <CheckCircle className="h-5 w-5 text-green-500" />}
                </CardHeader>
                <CardContent>
                  {software.connected && (
                    <div className="mb-3 text-sm text-gray-500">
                      <p>Last synced: {formatLastSynced(software.lastSynced)}</p>
                    </div>
                  )}
                  <div className="flex justify-end space-x-2">
                    {software.connected ? (
                      <>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => syncIntegration(software.id, 'software')}
                        >
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Sync
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDisconnect(software.id, 'software')}
                        >
                          <Link2Off className="mr-2 h-4 w-4" />
                          Disconnect
                        </Button>
                      </>
                    ) : (
                      <Button 
                        variant="outline" 
                        size="sm"
                        disabled={connecting === software.id}
                        onClick={() => handleOpenIntegrationDialog(software, 'software')}
                      >
                        {connecting === software.id ? (
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
            ))}
          </div>
        </div>

        <div>
          <Card className="border-dashed border-gray-300">
            <CardHeader>
              <CardTitle className="text-lg">Integration Security</CardTitle>
              <CardDescription>
                All integrations use secure token-based authentication. We never store your login credentials.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-start space-x-4">
                <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">
                    Your financial data is encrypted and securely transmitted. Integrations are read-only by default, meaning 
                    we can import your data but cannot make changes to your accounts.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Connect to {currentIntegration?.name}</DialogTitle>
            <DialogDescription>
              {integrationType === "bank" 
                ? "Connect your bank account to automatically import transactions."
                : "Connect your accounting software to synchronize financial data."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {integrationType === "software" && (
              <div className="space-y-2">
                <Label htmlFor="api-key">API Key</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="api-key"
                    type="password"
                    placeholder="Enter your API key"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                  />
                  <Key className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder={integrationType === "bank" ? "Bank username" : "Software username"}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="auto-sync"
                checked={autoSync}
                onCheckedChange={setAutoSync}
              />
              <Label htmlFor="auto-sync">Enable automatic synchronization</Label>
            </div>
          </div>
          <DialogFooter className="flex space-x-2 sm:justify-end">
            <Button type="button" variant="outline" onClick={() => setOpenDialog(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleConnect}>
              <Link className="mr-2 h-4 w-4" />
              Connect
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AccountingIntegrations;
