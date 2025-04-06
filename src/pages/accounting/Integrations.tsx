
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  Building, 
  CreditCard, 
  CheckCircle, 
  ArrowRight, 
  RefreshCw,
  AlertCircle 
} from "lucide-react";

interface BankIntegration {
  id: string;
  name: string;
  logoSrc: string;
  connected: boolean;
}

const AccountingIntegrations = () => {
  const { toast } = useToast();
  const [connecting, setConnecting] = useState<string | null>(null);
  
  const banks: BankIntegration[] = [
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
  ];

  const accountingSoftware = [
    { id: "xero", name: "Xero", logoSrc: "/placeholder.svg", connected: false },
    { id: "quickbooks", name: "QuickBooks", logoSrc: "/placeholder.svg", connected: false },
    { id: "sage", name: "Sage", logoSrc: "/placeholder.svg", connected: false },
    { id: "wave", name: "Wave", logoSrc: "/placeholder.svg", connected: false },
  ];
  
  const handleConnect = (id: string, type: 'bank' | 'software') => {
    setConnecting(id);
    
    // Simulate connection process
    setTimeout(() => {
      setConnecting(null);
      toast({
        title: "Connection Successful",
        description: `Successfully connected to ${type === 'bank' ? 'bank account' : 'accounting software'}.`,
      });
    }, 2000);
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
              <Card key={bank.id} className="hover:shadow-md transition-shadow">
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
                  <div className="flex justify-end">
                    <Button 
                      variant="outline" 
                      size="sm"
                      disabled={connecting === bank.id}
                      onClick={() => handleConnect(bank.id, 'bank')}
                    >
                      {connecting === bank.id ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Connecting...
                        </>
                      ) : (
                        <>
                          Connect
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
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
              <Card key={software.id} className="hover:shadow-md transition-shadow">
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
                  <div className="flex justify-end">
                    <Button 
                      variant="outline" 
                      size="sm"
                      disabled={connecting === software.id}
                      onClick={() => handleConnect(software.id, 'software')}
                    >
                      {connecting === software.id ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Connecting...
                        </>
                      ) : (
                        <>
                          Connect
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
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
    </div>
  );
};

export default AccountingIntegrations;
