import { v4 as uuidv4 } from 'uuid';

export interface ErrorLog {
  id: string;
  timestamp: Date;
  message: string;
  stack?: string;
  context?: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export class ErrorTrackingService {
  private static instance: ErrorTrackingService;
  private errorLogs: ErrorLog[] = [];
  private maxLogSize = 50;

  private constructor() {}

  public static getInstance(): ErrorTrackingService {
    if (!ErrorTrackingService.instance) {
      ErrorTrackingService.instance = new ErrorTrackingService();
    }
    return ErrorTrackingService.instance;
  }

  // Log an error with detailed context
  public logError(
    error: Error, 
    context?: Record<string, any>, 
    severity: ErrorLog['severity'] = 'medium'
  ): ErrorLog {
    const errorLog: ErrorLog = {
      id: uuidv4(),
      timestamp: new Date(),
      message: error.message,
      stack: error.stack,
      context: {
        ...context,
        userAgent: navigator.userAgent,
        url: window.location.href
      },
      severity
    };

    // Maintain log size
    if (this.errorLogs.length >= this.maxLogSize) {
      this.errorLogs.shift();
    }
    this.errorLogs.push(errorLog);

    // Optional: Send to external error tracking service
    this.reportToExternalService(errorLog);

    return errorLog;
  }

  // Retrieve error logs
  public getErrorLogs(
    filter?: Partial<Pick<ErrorLog, 'severity'>>
  ): ErrorLog[] {
    return filter 
      ? this.errorLogs.filter(log => 
          filter.severity ? log.severity === filter.severity : true
        )
      : this.errorLogs;
  }

  // Clear error logs
  public clearErrorLogs(): void {
    this.errorLogs = [];
  }

  // Analyze error patterns
  public analyzeErrorPatterns(): Record<string, number> {
    return this.errorLogs.reduce((patterns, log) => {
      const key = log.message;
      patterns[key] = (patterns[key] || 0) + 1;
      return patterns;
    }, {} as Record<string, number>);
  }

  // Private method for external error reporting
  private reportToExternalService(errorLog: ErrorLog): void {
    // Placeholder for external error tracking integration
    // Could be integrated with services like Sentry, LogRocket, etc.
    if (import.meta.env.PROD) {
      try {
        // Example pseudo-code for external error reporting
        // ExternalErrorTracker.capture(errorLog);
        console.log('Error reported to external service', errorLog);
      } catch (reportError) {
        console.error('Failed to report error to external service', reportError);
      }
    }
  }

  // Determine error severity based on error type
  public determineSeverity(error: Error): ErrorLog['severity'] {
    const criticalErrors = [
      'UnauthorizedError',
      'FatalError',
      'NetworkError'
    ];

    const highSeverityErrors = [
      'ValidationError',
      'ConfigurationError'
    ];

    const errorName = error.constructor.name;

    if (criticalErrors.includes(errorName)) return 'critical';
    if (highSeverityErrors.includes(errorName)) return 'high';
    
    return error.message.includes('fatal') ? 'high' : 'medium';
  }
}

// Singleton instance for easy access
export const errorTracker = ErrorTrackingService.getInstance();
