
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const TaxSettings = () => {
  const { toast } = useToast();
  const [vatSettings, setVatSettings] = useState({
    vatNumber: "4820156073",
    vatRate: 15,
    filingFrequency: "Quarterly",
  });

  const [taxNumbers, setTaxNumbers] = useState({
    companyTaxNumber: "9034721850",
    payeNumber: "7105836294",
    uifNumber: "U123456789",
  });

  const handleSaveVatSettings = () => {
    toast({
      title: "VAT Settings Saved",
      description: "Your VAT settings have been updated successfully",
    });
  };

  const handleSaveTaxNumbers = () => {
    toast({
      title: "Tax Numbers Saved",
      description: "Your tax registration numbers have been updated successfully",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Tax Settings</h1>
        <p className="text-gray-500">Configure your tax rates and preferences</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>VAT Settings</CardTitle>
            <CardDescription>Configure your Value-Added Tax settings</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="vatNumber">
                  VAT Registration Number
                </label>
                <Input
                  id="vatNumber"
                  placeholder="VAT Number"
                  value={vatSettings.vatNumber}
                  onChange={(e) => setVatSettings({ ...vatSettings, vatNumber: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="vatRate">
                  VAT Rate (%)
                </label>
                <Input
                  id="vatRate"
                  type="number"
                  placeholder="VAT Rate"
                  value={vatSettings.vatRate}
                  onChange={(e) => setVatSettings({ ...vatSettings, vatRate: Number(e.target.value) })}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="filingFrequency">
                  Filing Frequency
                </label>
                <select
                  id="filingFrequency"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={vatSettings.filingFrequency}
                  onChange={(e) => setVatSettings({ ...vatSettings, filingFrequency: e.target.value })}
                >
                  <option value="Monthly">Monthly</option>
                  <option value="Bimonthly">Bimonthly</option>
                  <option value="Quarterly">Quarterly</option>
                  <option value="Annually">Annually</option>
                </select>
              </div>
              
              <Button type="button" onClick={handleSaveVatSettings}>
                Save VAT Settings
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tax Registration Numbers</CardTitle>
            <CardDescription>Manage your tax identification numbers</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="companyTaxNumber">
                  Company Tax Number
                </label>
                <Input
                  id="companyTaxNumber"
                  placeholder="Company Tax Number"
                  value={taxNumbers.companyTaxNumber}
                  onChange={(e) => setTaxNumbers({ ...taxNumbers, companyTaxNumber: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="payeNumber">
                  PAYE Registration Number
                </label>
                <Input
                  id="payeNumber"
                  placeholder="PAYE Number"
                  value={taxNumbers.payeNumber}
                  onChange={(e) => setTaxNumbers({ ...taxNumbers, payeNumber: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="uifNumber">
                  UIF Registration Number
                </label>
                <Input
                  id="uifNumber"
                  placeholder="UIF Number"
                  value={taxNumbers.uifNumber}
                  onChange={(e) => setTaxNumbers({ ...taxNumbers, uifNumber: e.target.value })}
                />
              </div>
              
              <Button type="button" onClick={handleSaveTaxNumbers}>
                Save Tax Numbers
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TaxSettings;
