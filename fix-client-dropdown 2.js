// This script directly adds the Ryzen client to your localStorage
// Run this in your browser console when you're on the quotes/invoices page

(function addRyzenClient() {
  // Define the Ryzen client
  const ryzenClient = {
    id: "ryzen-client",
    name: "Ryzen (PTY) LTD",
    address: "12 Mark Str",
    email: "them@ryzen.com",
    phone: "0762458759",
    type: "company",
    city: "Tshwane",
    province: "Gauteng",
    postalCode: "0006",
    credit: 3000,
    outstanding: 0,
    overdue: 0,
    contactPerson: "Tom Mark"
  };

  try {
    // Try to add to mokClients
    const savedClients = localStorage.getItem('mokClients');
    if (savedClients) {
      const parsedClients = JSON.parse(savedClients);
      
      // Make sure companies array exists
      if (!Array.isArray(parsedClients.companies)) {
        parsedClients.companies = [];
      }
      
      // Check if Ryzen client already exists
      if (!parsedClients.companies.some(c => c.id === ryzenClient.id)) {
        // Add Ryzen client to companies array
        parsedClients.companies.push(ryzenClient);
        
        // Update mokClients in localStorage
        localStorage.setItem('mokClients', JSON.stringify(parsedClients));
        console.log('✅ Added Ryzen client to mokClients');
      } else {
        console.log('ℹ️ Ryzen client already exists in mokClients');
      }
    } else {
      // If mokClients doesn't exist, create it
      localStorage.setItem('mokClients', JSON.stringify({
        companies: [ryzenClient],
        individuals: [],
        vendors: []
      }));
      console.log('✅ Created mokClients with Ryzen client');
    }
    
    // Also force-set selectedClientForInvoice
    localStorage.setItem('selectedClientForInvoice', JSON.stringify(ryzenClient));
    console.log('✅ Set selectedClientForInvoice to Ryzen client');
    
    alert('✅ Ryzen (PTY) LTD has been added to your client list!\n\nPlease reload the page to see it in your client dropdown.');
  } catch (error) {
    console.error('❌ Error adding Ryzen client:', error);
    alert('❌ There was an error adding the Ryzen client. Please check the console for details.');
  }
})();
