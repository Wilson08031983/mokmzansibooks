import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Building2,
  User,
  Truck,
  Search,
  PlusCircle,
  Mail,
  Phone,
  MapPin,
  Clock,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";

const mockClients = {
  companies: [
    {
      id: "c1",
      name: "ABC Construction Ltd",
      contactPerson: "John Smith",
      email: "john@abcconstruction.co.za",
      phone: "+27 82 123 4567",
      address: "45 Main Road, Cape Town, 8001",
      lastInteraction: "2023-03-25",
      type: "company",
    },
    {
      id: "c2",
      name: "Durban Electronics",
      contactPerson: "Sarah Johnson",
      email: "sarah@durbanelectronics.co.za",
      phone: "+27 83 987 6543",
      address: "12 Beach Avenue, Durban, 4001",
      lastInteraction: "2023-03-20",
      type: "company",
    },
  ],
  individuals: [
    {
      id: "i1",
      name: "Michael Ndlovu",
      email: "michael@example.com",
      phone: "+27 71 555 7890",
      address: "78 Oak Street, Johannesburg, 2000",
      lastInteraction: "2023-03-28",
      type: "individual",
    },
  ],
  vendors: [
    {
      id: "v1",
      name: "SA Office Supplies",
      contactPerson: "David Wilson",
      email: "david@saoffice.co.za",
      phone: "+27 11 222 3344",
      address: "56 Commerce Park, Pretoria, 0002",
      lastInteraction: "2023-03-15",
      type: "vendor",
    },
  ],
};

const Clients = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("companies");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newClientData, setNewClientData] = useState({
    name: "",
    contactPerson: "",
    email: "",
    phone: "",
    address: "",
    addressLine2: "",
    city: "",
    province: "",
    postalCode: "",
    type: "company",
  });
  const { toast } = useToast();

  const clientCount = {
    companies: mockClients.companies.length,
    individuals: mockClients.individuals.length,
    vendors: mockClients.vendors.length,
    all: mockClients.companies.length + mockClients.individuals.length + mockClients.vendors.length,
  };

  const filteredClients = (type: string) => {
    let clients = [];
    
    switch (type) {
      case "companies":
        clients = mockClients.companies;
        break;
      case "individuals":
        clients = mockClients.individuals;
        break;
      case "vendors":
        clients = mockClients.vendors;
        break;
      default:
        clients = [
          ...mockClients.companies,
          ...mockClients.individuals,
          ...mockClients.vendors,
        ];
    }
    
    if (!searchTerm) return clients;
    
    return clients.filter((client) =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.contactPerson && client.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-ZA");
  };

  const getClientIcon = (type: string) => {
    switch (type) {
      case "company":
        return <Building2 className="h-10 w-10 text-blue-500" />;
      case "individual":
        return <User className="h-10 w-10 text-green-500" />;
      case "vendor":
        return <Truck className="h-10 w-10 text-amber-500" />;
      default:
        return <Building2 className="h-10 w-10 text-gray-500" />;
    }
  };

  const handleAddClient = () => {
    toast({
      title: "Client added",
      description: `${newClientData.name} has been added successfully.`,
    });
    
    setIsDialogOpen(false);
    setNewClientData({
      name: "",
      contactPerson: "",
      email: "",
      phone: "",
      address: "",
      addressLine2: "",
      city: "",
      province: "",
      postalCode: "",
      type: "company",
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewClientData({
      ...newClientData,
      [name]: value,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Clients</h1>
          <p className="text-gray-500">
            Manage your companies, individuals, and vendors
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="default" className="bg-brand-purple hover:bg-brand-purple/80 font-semibold shadow-md">
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Client
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Client</DialogTitle>
              <DialogDescription>
                Enter the details of the new client below.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="clientType" className="text-right">
                  Type
                </Label>
                <select
                  id="type"
                  name="type"
                  className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={newClientData.type}
                  onChange={handleInputChange}
                >
                  <option value="company">Company</option>
                  <option value="individual">Individual</option>
                  <option value="vendor">Vendor</option>
                </select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  className="col-span-3"
                  value={newClientData.name}
                  onChange={handleInputChange}
                />
              </div>
              {newClientData.type !== "individual" && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="contactPerson" className="text-right">
                    Contact Person
                  </Label>
                  <Input
                    id="contactPerson"
                    name="contactPerson"
                    className="col-span-3"
                    value={newClientData.contactPerson}
                    onChange={handleInputChange}
                  />
                </div>
              )}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  className="col-span-3"
                  value={newClientData.email}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right">
                  Phone
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  className="col-span-3"
                  value={newClientData.phone}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="address" className="text-right">
                  Address
                </Label>
                <Input
                  id="address"
                  name="address"
                  placeholder="Street address"
                  className="col-span-3"
                  value={newClientData.address}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="addressLine2" className="text-right">
                  Address Line 2
                </Label>
                <Input
                  id="addressLine2"
                  name="addressLine2"
                  placeholder="Apt, Suite, Unit, etc."
                  className="col-span-3"
                  value={newClientData.addressLine2}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="city" className="text-right">
                  City
                </Label>
                <Input
                  id="city"
                  name="city"
                  className="col-span-3"
                  value={newClientData.city}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="province" className="text-right">
                  Province
                </Label>
                <Input
                  id="province"
                  name="province"
                  className="col-span-3"
                  value={newClientData.province}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="postalCode" className="text-right">
                  Postal Code
                </Label>
                <Input
                  id="postalCode"
                  name="postalCode"
                  className="col-span-3"
                  value={newClientData.postalCode}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button type="submit" onClick={handleAddClient}>Add Client</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-1/4 flex flex-col space-y-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search clients..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Card>
            <CardContent className="p-4">
              <Tabs
                defaultValue="companies"
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid grid-cols-1 mb-4">
                  <TabsTrigger value="companies" className="justify-start px-2 py-1.5 h-9">
                    <Building2 className="mr-2 h-4 w-4" />
                    Companies ({clientCount.companies})
                  </TabsTrigger>
                  <TabsTrigger value="individuals" className="justify-start px-2 py-1.5 h-9">
                    <User className="mr-2 h-4 w-4" />
                    Individuals ({clientCount.individuals})
                  </TabsTrigger>
                  <TabsTrigger value="vendors" className="justify-start px-2 py-1.5 h-9">
                    <Truck className="mr-2 h-4 w-4" />
                    Vendors ({clientCount.vendors})
                  </TabsTrigger>
                </TabsList>
              
                <div className="hidden">
                  <TabsContent value="companies">
                    {/* Content hidden but needed for proper structure */}
                  </TabsContent>
                  <TabsContent value="individuals">
                    {/* Content hidden but needed for proper structure */}
                  </TabsContent>
                  <TabsContent value="vendors">
                    {/* Content hidden but needed for proper structure */}
                  </TabsContent>
                </div>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="w-full md:w-3/4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsContent value="companies" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Companies ({clientCount.companies})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredClients("companies").length > 0 ? (
                      filteredClients("companies").map((client) => (
                        <div
                          key={client.id}
                          className="flex gap-4 p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100">
                            {getClientIcon(client.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                              <h3 className="text-lg font-medium truncate">{client.name}</h3>
                              <div className="flex items-center text-sm text-gray-500">
                                <Clock className="mr-1 h-4 w-4" />
                                Last interaction: {formatDate(client.lastInteraction)}
                              </div>
                            </div>
                            <p className="text-sm text-gray-600">
                              Contact: {client.contactPerson}
                            </p>
                            <div className="mt-2 flex flex-col md:flex-row md:items-center gap-y-1 gap-x-4 text-sm text-gray-500">
                              <div className="flex items-center">
                                <Mail className="mr-1 h-4 w-4" />
                                {client.email}
                              </div>
                              <div className="flex items-center">
                                <Phone className="mr-1 h-4 w-4" />
                                {client.phone}
                              </div>
                              <div className="flex items-center">
                                <MapPin className="mr-1 h-4 w-4 flex-shrink-0" />
                                <span className="truncate">{client.address}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        No companies found matching your search
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="individuals" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Individuals ({clientCount.individuals})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredClients("individuals").length > 0 ? (
                      filteredClients("individuals").map((client) => (
                        <div
                          key={client.id}
                          className="flex gap-4 p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100">
                            {getClientIcon(client.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                              <h3 className="text-lg font-medium truncate">{client.name}</h3>
                              <div className="flex items-center text-sm text-gray-500">
                                <Clock className="mr-1 h-4 w-4" />
                                Last interaction: {formatDate(client.lastInteraction)}
                              </div>
                            </div>
                            <div className="mt-2 flex flex-col md:flex-row md:items-center gap-y-1 gap-x-4 text-sm text-gray-500">
                              <div className="flex items-center">
                                <Mail className="mr-1 h-4 w-4" />
                                {client.email}
                              </div>
                              <div className="flex items-center">
                                <Phone className="mr-1 h-4 w-4" />
                                {client.phone}
                              </div>
                              <div className="flex items-center">
                                <MapPin className="mr-1 h-4 w-4 flex-shrink-0" />
                                <span className="truncate">{client.address}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        No individuals found matching your search
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="vendors" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Vendors ({clientCount.vendors})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredClients("vendors").length > 0 ? (
                      filteredClients("vendors").map((client) => (
                        <div
                          key={client.id}
                          className="flex gap-4 p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-amber-100">
                            {getClientIcon(client.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                              <h3 className="text-lg font-medium truncate">{client.name}</h3>
                              <div className="flex items-center text-sm text-gray-500">
                                <Clock className="mr-1 h-4 w-4" />
                                Last interaction: {formatDate(client.lastInteraction)}
                              </div>
                            </div>
                            <p className="text-sm text-gray-600">
                              Contact: {client.contactPerson}
                            </p>
                            <div className="mt-2 flex flex-col md:flex-row md:items-center gap-y-1 gap-x-4 text-sm text-gray-500">
                              <div className="flex items-center">
                                <Mail className="mr-1 h-4 w-4" />
                                {client.email}
                              </div>
                              <div className="flex items-center">
                                <Phone className="mr-1 h-4 w-4" />
                                {client.phone}
                              </div>
                              <div className="flex items-center">
                                <MapPin className="mr-1 h-4 w-4 flex-shrink-0" />
                                <span className="truncate">{client.address}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        No vendors found matching your search
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Clients;
