
/**
 * Sync Manager for handling online/offline synchronization
 */

// Type for sync listeners
type SyncStatusListener = () => void;

class SyncManager {
  private _isOnline: boolean = navigator.onLine;
  private _pendingSyncCount: number = 0;
  private _listeners: SyncStatusListener[] = [];

  constructor() {
    // Set up network status event listeners
    window.addEventListener('online', this.handleNetworkChange.bind(this));
    window.addEventListener('offline', this.handleNetworkChange.bind(this));

    // Initialize with a random number of "pending" items for development
    this._pendingSyncCount = Math.floor(Math.random() * 3);
  }

  private handleNetworkChange() {
    this._isOnline = navigator.onLine;
    this.notifyListeners();
  }

  // Check if the device is currently online
  isNetworkOnline(): boolean {
    return this._isOnline;
  }

  // Get count of items waiting to be synced
  getPendingSyncCount(): number {
    return this._pendingSyncCount;
  }

  // Add a pending sync item
  addPendingSync(): number {
    this._pendingSyncCount++;
    this.notifyListeners();
    return this._pendingSyncCount;
  }

  // Remove a pending sync item
  removePendingSync(): number {
    if (this._pendingSyncCount > 0) {
      this._pendingSyncCount--;
      this.notifyListeners();
    }
    return this._pendingSyncCount;
  }

  // Register a listener for sync status changes
  addListener(listener: SyncStatusListener): void {
    if (!this._listeners.includes(listener)) {
      this._listeners.push(listener);
    }
  }

  // Remove a previously registered listener
  removeListener(listener: SyncStatusListener): void {
    const index = this._listeners.indexOf(listener);
    if (index !== -1) {
      this._listeners.splice(index, 1);
    }
  }

  // Notify all listeners of a state change
  private notifyListeners(): void {
    this._listeners.forEach(listener => listener());
  }
}

// Create a singleton instance
const syncManager = new SyncManager();

export { syncManager };
export default syncManager;
