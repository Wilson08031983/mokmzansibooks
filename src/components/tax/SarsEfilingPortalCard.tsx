
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

interface SarsEfilingPortalCardProps {
  className?: string;
}

const SarsEfilingPortalCard = ({ className }: SarsEfilingPortalCardProps) => {
  return (
    <Card className={`bg-blue-50 border-blue-200 ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ExternalLink className="h-6 w-6 text-blue-600" />
          SARS e-Filing Portal
        </CardTitle>
        <CardDescription>
          Access the official SARS e-Filing website for submissions and downloads
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-sm text-gray-700">
              All official tax submissions must be done through the SARS e-Filing portal. 
              Our system helps prepare the necessary reports and manage your documents.
            </p>
          </div>
          <Button 
            variant="outline" 
            className="border-blue-500 text-blue-600 hover:bg-blue-100"
            onClick={() => window.open('https://www.sarsefiling.co.za', '_blank')}
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Go to SARS e-Filing
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SarsEfilingPortalCard;
