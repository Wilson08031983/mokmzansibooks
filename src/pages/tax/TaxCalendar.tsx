
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { CalendarIcon, Download, FileText } from "lucide-react";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { downloadDocumentAsPdf } from "@/utils/pdfUtils";

const TaxCalendar = () => {
  const { toast } = useToast();
  const calendarRef = useRef<HTMLDivElement>(null);
  const [taxDeadlines] = useState([
    {
      id: "deadline-1",
      title: "VAT Return (Q1)",
      date: "2025-04-30",
      description: "Submit VAT return for January to March 2025",
      type: "VAT",
    },
    {
      id: "deadline-2",
      title: "Monthly PAYE",
      date: "2025-04-07",
      description: "Submit PAYE for March 2025",
      type: "PAYE",
    },
    {
      id: "deadline-3",
      title: "Provisional Tax Payment",
      date: "2025-06-30",
      description: "First provisional tax payment for 2025 tax year",
      type: "Provisional Tax",
    },
    {
      id: "deadline-4",
      title: "VAT Return (Q2)",
      date: "2025-07-31",
      description: "Submit VAT return for April to June 2025",
      type: "VAT",
    },
    {
      id: "deadline-5",
      title: "Annual Income Tax Return",
      date: "2025-12-31",
      description: "Submit annual income tax return (ITR14) for 2024 tax year",
      type: "Income Tax",
    },
  ]);

  // Sort deadlines by date
  const sortedDeadlines = [...taxDeadlines].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const handleDeadlineClick = (id: string) => {
    const deadline = taxDeadlines.find(d => d.id === id);
    if (deadline) {
      toast({
        title: deadline.title,
        description: deadline.description,
      });
    }
  };

  const getDeadlineColor = (type: string) => {
    switch (type) {
      case "VAT":
        return "bg-blue-100 text-blue-800";
      case "PAYE":
        return "bg-green-100 text-green-800";
      case "Provisional Tax":
        return "bg-purple-100 text-purple-800";
      case "Income Tax":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-ZA', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    }).format(date);
  };

  const handleDownloadCalendar = async () => {
    if (!calendarRef.current) return;
    
    toast({
      title: "Generating PDF",
      description: "Your tax calendar is being prepared for download...",
    });
    
    try {
      const success = await downloadDocumentAsPdf(
        calendarRef.current,
        "tax-calendar.pdf"
      );
      
      if (success) {
        toast({
          title: "Download Complete",
          description: "Tax calendar has been downloaded successfully.",
        });
      } else {
        throw new Error("Failed to generate PDF");
      }
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "There was a problem generating your tax calendar PDF.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Tax Calendar</h1>
          <p className="text-gray-500">Stay on top of important tax deadlines</p>
        </div>
        <Button onClick={handleDownloadCalendar} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Download Calendar
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Tax Deadlines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4" ref={calendarRef}>
            {sortedDeadlines.map((deadline) => (
              <div 
                key={deadline.id}
                className="flex items-start p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => handleDeadlineClick(deadline.id)}
              >
                <div className="mr-4 bg-gray-100 p-3 rounded-full">
                  <CalendarIcon className="h-6 w-6 text-gray-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{deadline.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs ${getDeadlineColor(deadline.type)}`}>
                      {deadline.type}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{deadline.description}</p>
                  <p className="text-sm font-medium mt-2">Due: {formatDate(deadline.date)}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TaxCalendar;
