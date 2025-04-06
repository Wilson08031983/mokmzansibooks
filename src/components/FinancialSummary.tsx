
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFinancialData } from "@/contexts/FinancialDataContext";
import { AlertCircle, Calendar, FileText } from "lucide-react";
import { Link } from "react-router-dom";

interface FinancialSummaryProps {
  type?: "compact" | "full";
}

export const FinancialSummary = ({ type = "full" }: FinancialSummaryProps) => {
  const { 
    getUpcomingDeadlines, 
    getRecentDocuments, 
    getTotalTaxLiability, 
    vatReturns, 
    payeReturns 
  } = useFinancialData();
  
  const upcomingDeadlines = getUpcomingDeadlines(3);
  const recentDocuments = getRecentDocuments(3);
  const totalTaxLiability = getTotalTaxLiability();
  
  // Calculate due returns count
  const dueVatReturns = vatReturns.filter(vat => vat.status === "Due").length;
  const duePayeReturns = payeReturns.filter(paye => paye.status === "Due").length;
  const totalDue = dueVatReturns + duePayeReturns;
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-ZA', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    }).format(date);
  };

  if (type === "compact") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Financial Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">Total Tax Liability</p>
                <p className="font-medium">{formatCurrency(totalTaxLiability)}</p>
              </div>
              {totalDue > 0 && (
                <div className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {totalDue} Due
                </div>
              )}
            </div>
            
            {upcomingDeadlines.length > 0 && (
              <div>
                <p className="text-sm text-gray-500 mb-2">Next Deadline</p>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                  <span>{upcomingDeadlines[0].title} - {formatDate(upcomingDeadlines[0].date)}</span>
                </div>
              </div>
            )}
            
            <div className="pt-2">
              <Link to="/tax" className="text-sm text-blue-600 hover:underline">
                View Tax Dashboard
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Financial Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Tax Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Total Tax Liability</p>
                <p className="text-xl font-semibold">{formatCurrency(totalTaxLiability)}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">VAT Returns</p>
                <p className="text-xl font-semibold">{dueVatReturns} Due</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">PAYE Returns</p>
                <p className="text-xl font-semibold">{duePayeReturns} Due</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Upcoming Deadlines</h3>
              <div className="space-y-3">
                {upcomingDeadlines.map((deadline) => (
                  <div key={deadline.id} className="flex items-start">
                    <Calendar className="h-5 w-5 mr-2 text-gray-500 mt-0.5" />
                    <div>
                      <p className="font-medium">{deadline.title}</p>
                      <p className="text-sm text-gray-500">{formatDate(deadline.date)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Recent Documents</h3>
              <div className="space-y-3">
                {recentDocuments.map((doc) => (
                  <div key={doc.id} className="flex items-start">
                    <FileText className="h-5 w-5 mr-2 text-gray-500 mt-0.5" />
                    <div>
                      <p className="font-medium">{doc.name}</p>
                      <p className="text-sm text-gray-500">{formatDate(doc.uploadDate)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="pt-2 flex justify-between">
            <Link to="/tax" className="text-sm text-blue-600 hover:underline">
              View Tax Dashboard
            </Link>
            <Link to="/reports" className="text-sm text-blue-600 hover:underline">
              View All Reports
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
