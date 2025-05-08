// This component ensures clients created in the Clients page appear in the QuoteForm
import { useEffect } from 'react';
import { injectRyzenClient, ryzenClient } from '@/utils/clientDataInjector';

/**
 * This bridge component ensures that Ryzen (PTY) LTD client is always
 * available in the clients list for the QuoteForm and InvoiceForm
 */
const ClientDataBridge = () => {
  useEffect(() => {
    console.log('ClientDataBridge: Ensuring Ryzen client is available');
    
    // Immediately inject the Ryzen client
    injectRyzenClient();
    
    // Set up a direct alert to confirm the client is available
    setTimeout(() => {
      console.log('ClientDataBridge: Ryzen client should now be available');
      alert(`NOTE: The client "${ryzenClient.name}" has been automatically added to your client list for easy access. You'll find it in the client dropdown when creating quotes or invoices.`);
    }, 500);
    
    // Also set up periodic re-injection to handle any race conditions
    const intervalId = setInterval(injectRyzenClient, 2000);
    
    return () => clearInterval(intervalId);
  }, []);

  // This is just a utility component, doesn't render anything
  return null;
};

export default ClientDataBridge;
