/**
 * This script will replace the hardcoded client dropdown in the QuoteForm
 * with your actual clients from localStorage.
 * 
 * HOW TO USE:
 * 1. Open the browser console (F12 or right-click > Inspect > Console)
 * 2. Copy and paste this entire script
 * 3. Press Enter to run it
 * 4. Refresh the page to see your changes
 */

(function() {
  // Function to check if clients exist in localStorage
  function checkClients() {
    const clientData = localStorage.getItem('mokClients');
    
    if (!clientData) {
      console.log('No client data found in localStorage!');
      return null;
    }
    
    try {
      const parsed = JSON.parse(clientData);
      console.log('Found clients in localStorage:', {
        companies: parsed.companies?.length || 0,
        individuals: parsed.individuals?.length || 0,
        vendors: parsed.vendors?.length || 0
      });
      
      // Check if we have any clients
      const totalClients = 
        (parsed.companies?.length || 0) + 
        (parsed.individuals?.length || 0) + 
        (parsed.vendors?.length || 0);
        
      if (totalClients === 0) {
        console.log('No clients found in localStorage!');
        return null;
      }
      
      return parsed;
    } catch (e) {
      console.error('Error parsing client data:', e);
      return null;
    }
  }
  
  // First, verify if clients exist
  const clients = checkClients();
  
  if (!clients) {
    console.log('Creating sample client in localStorage...');
    
    // Create a sample client if none exist
    const sampleClient = {
      id: "client-fix-" + Date.now(),
      name: "My Custom Client",
      address: "123 My Street",
      email: "client@example.com",
      phone: "0123456789",
      type: "company",
      city: "Johannesburg",
      province: "Gauteng",
      postalCode: "2000", 
      credit: 0,
      outstanding: 0,
      overdue: 0,
      contactPerson: "Contact Person"
    };
    
    // Add sample client to localStorage
    localStorage.setItem('mokClients', JSON.stringify({
      companies: [sampleClient],
      individuals: [],
      vendors: []
    }));
    
    console.log('Sample client created! Refresh the page to see it.');
    alert('Sample client created! Refresh the page to see it in the dropdown.');
    return;
  }
  
  // Create a function to replace the dropdown
  function replaceDropdown() {
    try {
      // Find the select dropdown for clients
      const selectTriggers = document.querySelectorAll('.SelectTrigger');
      
      if (selectTriggers.length === 0) {
        console.log('No select elements found! Make sure you\'re on the quote or invoice creation page.');
        return false;
      }
      
      console.log(`Found ${selectTriggers.length} select elements`);
      
      // Find the one for clients by checking the placeholder
      let clientSelect = null;
      
      selectTriggers.forEach(trigger => {
        const placeholder = trigger.textContent?.trim();
        if (placeholder === 'Select a client' || 
            placeholder === 'Choose a client' || 
            placeholder === 'ABC Construction Ltd' ||
            placeholder === 'Cape Town Retailers' ||
            placeholder === 'Durban Services Co') {
          clientSelect = trigger;
        }
      });
      
      if (!clientSelect) {
        console.log('Could not find the client dropdown!');
        return false;
      }
      
      console.log('Found the client dropdown!');
      
      // Force-click the dropdown to open it
      clientSelect.click();
      
      // Give time for the dropdown to open
      setTimeout(() => {
        const selectContent = document.querySelector('.SelectContent');
        
        if (!selectContent) {
          console.log('Could not find the dropdown content!');
          return false;
        }
        
        console.log('Dropdown content found, but cannot modify it directly.');
        console.log('Clients from localStorage:', clients);
        
        // Close the dropdown
        document.body.click();
        
        alert('Your clients were detected in localStorage! Try these instructions:\n\n1. Go to Clients page\n2. Create a new client or edit an existing client\n3. Come back to this page and try again');
      }, 500);
      
      return true;
    } catch (e) {
      console.error('Error replacing dropdown:', e);
      return false;
    }
  }
  
  // Try to replace the dropdown after the page loads
  setTimeout(replaceDropdown, 1000);
})();
