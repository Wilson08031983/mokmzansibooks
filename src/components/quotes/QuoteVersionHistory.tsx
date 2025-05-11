
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { History, ArrowUpDown, AlertTriangle, CheckCircle } from 'lucide-react';

interface QuoteVersion {
  id: string;
  versionNumber: number;
  timestamp: string;
  changes: string;
  data: any;
}

interface QuoteVersionHistoryProps {
  quoteId: string;
  currentQuote: any;
  onVersionRestored: () => void;
}

const QuoteVersionHistory: React.FC<QuoteVersionHistoryProps> = ({
  quoteId,
  currentQuote,
  onVersionRestored
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [versions, setVersions] = useState<QuoteVersion[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<QuoteVersion | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Simulate fetching versions
  const fetchVersions = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // In a real implementation, this would fetch from an API or local storage
      // For now, just create a simulated version history
      const mockVersions: QuoteVersion[] = [
        {
          id: 'v1',
          versionNumber: 1,
          timestamp: new Date(Date.now() - 86400000 * 7).toISOString(), // 7 days ago
          changes: 'Initial version',
          data: { ...currentQuote, items: currentQuote.items.slice(0, 1) }
        },
        {
          id: 'v2',
          versionNumber: 2,
          timestamp: new Date(Date.now() - 86400000 * 3).toISOString(), // 3 days ago
          changes: 'Added new line items',
          data: { ...currentQuote }
        }
      ];
      
      setVersions(mockVersions);
    } catch (err) {
      setError('Failed to load version history');
      console.error('Error loading versions:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Call fetch on first render
  React.useEffect(() => {
    fetchVersions();
  }, [quoteId]);

  const handleRestoreVersion = (version: QuoteVersion) => {
    // In a real implementation, this would restore the quote
    console.log('Restoring version:', version);
    
    // Call the callback
    onVersionRestored();
  };
  
  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleString();
    } catch (e) {
      return dateStr;
    }
  };

  if (isLoading) {
    return <div className="py-8 text-center">Loading version history...</div>;
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-6">
          <AlertTriangle className="text-amber-500 mr-2 h-5 w-5" />
          <span>{error}</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Version History</h3>
          <p className="text-sm text-gray-500">
            Showing {versions.length} versions of this quote
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchVersions}
          className="flex items-center gap-2"
        >
          <History className="h-4 w-4" />
          Refresh
        </Button>
      </div>
      
      {versions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <History className="h-12 w-12 text-gray-300 mb-3" />
            <h3 className="font-medium">No Version History</h3>
            <p className="text-sm text-gray-500 max-w-sm mt-1">
              There is no version history for this quote yet. Version history will be created when changes are made.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Version</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead>Changes</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {versions.map((version) => (
                <TableRow key={version.id}>
                  <TableCell>
                    <Badge variant="outline">v{version.versionNumber}</Badge>
                  </TableCell>
                  <TableCell>{formatDate(version.timestamp)}</TableCell>
                  <TableCell>{version.changes}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRestoreVersion(version)}
                    >
                      Restore
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      
      {selectedVersion && (
        <div className="mt-6 border-t pt-6">
          <h3 className="text-lg font-medium mb-4">Preview Version {selectedVersion.versionNumber}</h3>
          <pre className="bg-gray-100 p-4 rounded-md overflow-auto text-xs">
            {JSON.stringify(selectedVersion.data, null, 2)}
          </pre>
          <div className="flex justify-end mt-4">
            <Button
              onClick={() => handleRestoreVersion(selectedVersion)}
              className="flex items-center gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              Restore This Version
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuoteVersionHistory;
