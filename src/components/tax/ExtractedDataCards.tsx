
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Brain } from "lucide-react";

interface ExtractedData {
  id: string;
  documentId: string;
  fields: Record<string, string>;
  extractedDate: string;
}

interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadDate: string;
  category: string;
}

interface ExtractedDataCardsProps {
  extractedData: ExtractedData[];
  documents: Document[];
  onUseForForm: (dataId: string) => void;
}

const ExtractedDataCards: React.FC<ExtractedDataCardsProps> = ({ 
  extractedData, 
  documents, 
  onUseForForm 
}) => {
  // Get document name by ID
  const getDocumentName = (docId: string) => {
    const doc = documents.find(d => d.id === docId);
    return doc ? doc.name : 'Unknown Document';
  };

  return (
    <div className="space-y-4">
      {extractedData.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
          <Brain className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium">No Extracted Data</h3>
          <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">
            Upload documents in Step 1 to extract form data that can be used for auto-filling your forms.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {extractedData.map(data => {
            const document = documents.find(doc => doc.id === data.documentId);
            return document ? (
              <Card key={data.id} className="border border-gray-200">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base">{getDocumentName(data.documentId)}</CardTitle>
                    <div className="flex space-x-2">
                      {data.fields.expiryDate && (
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                          <span className="text-xs">
                            Expires: {new Date(data.fields.expiryDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {Object.entries(data.fields)
                      .filter(([key]) => key !== 'expiryDate')
                      .map(([key, value], idx) => (
                        <div key={idx}>
                          <p className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                          <p className="text-gray-600">{value}</p>
                        </div>
                      ))}
                  </div>
                  <div className="mt-4 flex justify-between items-center">
                    <Badge variant="outline" className="text-xs">
                      {Object.keys(data.fields).length} fields extracted
                    </Badge>
                    <Button variant="default" size="sm" onClick={() => onUseForForm(data.id)}>
                      Use for Auto-Fill
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : null;
          })}
        </div>
      )}
    </div>
  );
};

export default ExtractedDataCards;
