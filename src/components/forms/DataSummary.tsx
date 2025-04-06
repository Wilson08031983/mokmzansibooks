
import React, { useState, useEffect } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, FileText, Clock, Copy } from 'lucide-react';
import { toast } from 'sonner';

export const DataSummary = () => {
  const [data, setData] = useState<Record<string, Record<string, string>>>(() => {
    try {
      const storedData = localStorage.getItem('extractedData');
      return storedData ? JSON.parse(storedData) : {};
    } catch {
      return {};
    }
  });
  
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  
  // Toggle a section's expanded state
  const toggleSection = (type: string) => {
    setExpandedSections(prev => ({ 
      ...prev, 
      [type]: !prev[type] 
    }));
  };
  
  // Reload data when localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const storedData = localStorage.getItem('extractedData');
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          setData(parsedData);
          
          // Auto-expand newly added sections
          const newSections = Object.keys(parsedData).reduce((acc, key) => {
            if (!Object.keys(data).includes(key)) {
              acc[key] = true;
            }
            return acc;
          }, {} as Record<string, boolean>);
          
          setExpandedSections(prev => ({ ...prev, ...newSections }));
        } else {
          setData({});
        }
      } catch (error) {
        console.error('Error parsing data from storage:', error);
        setData({});
      }
    };
    
    // Add event listener for both storage event and custom event
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('storageupdated', handleStorageChange);
    
    // Also check on mount
    handleStorageChange();
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('storageupdated', handleStorageChange);
    };
  }, [data]);
  
  const copyToClipboard = (type: string) => {
    if (!data[type]) return;
    
    const typeData = data[type];
    let text = `${type.toUpperCase()} DATA:\n\n`;
    
    Object.entries(typeData)
      .filter(([key]) => !key.startsWith('_'))
      .forEach(([key, value]) => {
        text += `${key}: ${value}\n`;
      });
    
    navigator.clipboard.writeText(text)
      .then(() => toast.success(`${type.replace('_', ' ')} data copied to clipboard`))
      .catch(() => toast.error('Failed to copy to clipboard'));
  };
  
  if (Object.keys(data).length === 0) {
    return (
      <div className="text-center py-6 text-gray-500">
        <p>No data has been extracted yet.</p>
        <p className="text-sm mt-2">Upload documents to extract business data.</p>
      </div>
    );
  }
  
  // Format a date string in a more readable format
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-ZA', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch {
      return 'Unknown date';
    }
  };
  
  return (
    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
      {Object.entries(data).map(([type, typeData]) => {
        // Skip internal fields
        const displayData = Object.entries(typeData).filter(([key]) => !key.startsWith('_'));
        
        if (displayData.length === 0) return null;
        
        const isExpanded = expandedSections[type] !== false; // Default to expanded
        const fieldCount = displayData.length;
        
        return (
          <Collapsible 
            key={type} 
            open={isExpanded}
            onOpenChange={() => toggleSection(type)}
            className="border rounded-lg overflow-hidden"
          >
            <CollapsibleTrigger asChild>
              <div className="bg-gray-50 p-4 flex justify-between items-center cursor-pointer hover:bg-gray-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-500" />
                    <h3 className="font-medium capitalize">
                      {type.replace('_', ' ')} Data
                    </h3>
                    <Badge variant="outline" className="ml-1">
                      {fieldCount} {fieldCount === 1 ? 'field' : 'fields'}
                    </Badge>
                  </div>
                  
                  {typeData._lastUpdated && (
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatDate(typeData._lastUpdated)}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(type);
                    }}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
              </div>
            </CollapsibleTrigger>
            
            <CollapsibleContent>
              <div className="p-4 divide-y">
                {displayData.map(([key, value]) => (
                  <div key={key} className="py-2 flex justify-between items-center text-sm">
                    <span className="text-gray-600 font-medium">{key}:</span>
                    <span className="font-medium max-w-[60%] truncate">{value}</span>
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        );
      })}
    </div>
  );
};

export default DataSummary;
