
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

// Import template previews
import Template1 from "@/components/invoices/templates/Template1";
import Template2 from "@/components/invoices/templates/Template2";
import Template3 from "@/components/invoices/templates/Template3";
import Template4 from "@/components/invoices/templates/Template4";
import Template5 from "@/components/invoices/templates/Template5";

const SelectTemplate = () => {
  const navigate = useNavigate();
  const [selectedTemplate, setSelectedTemplate] = useState<number>(1);

  const handleContinue = () => {
    navigate("/invoices/new", { state: { templateId: selectedTemplate } });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="ghost" asChild>
            <Link to="/invoices">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Invoices
            </Link>
          </Button>
          <h1 className="text-2xl font-bold ml-4">Select Invoice Template</h1>
        </div>
      </div>

      <p className="text-muted-foreground">
        Choose from one of our professional invoice templates below
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5].map((id) => (
          <Card 
            key={id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedTemplate === id ? "ring-2 ring-primary" : ""
            }`}
            onClick={() => setSelectedTemplate(id)}
          >
            <CardContent className="p-4">
              <div className="aspect-[1/1.414] bg-white border rounded-md overflow-hidden flex items-center justify-center">
                <div className="transform scale-[0.3] origin-center w-full h-full">
                  {id === 1 && <Template1 preview />}
                  {id === 2 && <Template2 preview />}
                  {id === 3 && <Template3 preview />}
                  {id === 4 && <Template4 preview />}
                  {id === 5 && <Template5 preview />}
                </div>
              </div>
              <p className="mt-2 text-center font-medium">Template {id}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-end gap-4">
        <Button variant="outline" asChild>
          <Link to="/invoices">Cancel</Link>
        </Button>
        <Button onClick={handleContinue}>Continue with Template {selectedTemplate}</Button>
      </div>
    </div>
  );
};

export default SelectTemplate;
