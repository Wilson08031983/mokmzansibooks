/**
 * A simple event bus to facilitate communication between components
 * This allows components to subscribe to and publish events without direct dependencies
 */

export type CompanyEventType = 'companyDetailsUpdated' | 'companyDataRestored';

// Define the structure of event listeners
interface CompanyEventListener {
  event: CompanyEventType;
  callback: (data?: any) => void;
  id: string;
}

// The event bus
class CompanyEventBus {
  private listeners: CompanyEventListener[] = [];
  
  /**
   * Subscribe to an event
   * @param event The event to listen for
   * @param callback The function to call when the event happens
   * @returns A unique id for this subscription that can be used to unsubscribe
   */
  subscribe(event: CompanyEventType, callback: (data?: any) => void): string {
    const id = Date.now().toString(36) + Math.random().toString(36).substring(2);
    this.listeners.push({ event, callback, id });
    return id;
  }
  
  /**
   * Unsubscribe from an event using the subscription id
   * @param id The subscription id returned from subscribe()
   */
  unsubscribe(id: string): void {
    this.listeners = this.listeners.filter(listener => listener.id !== id);
  }
  
  /**
   * Publish an event to all subscribers
   * @param event The event to publish
   * @param data Optional data to pass to subscribers
   */
  publish(event: CompanyEventType, data?: any): void {
    // Add a small delay to ensure React state updates have completed
    setTimeout(() => {
      this.listeners
        .filter(listener => listener.event === event)
        .forEach(listener => {
          try {
            listener.callback(data);
          } catch (error) {
            console.error(`Error in event listener for ${event}:`, error);
          }
        });
    }, 0);
  }
}

// Create a singleton instance
const eventBus = new CompanyEventBus();

export default eventBus;
