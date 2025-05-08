import React, { createContext, useContext, useState, useCallback, useMemo, Component, ErrorInfo, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useUserBehavior } from './UserBehaviorContext';
import { RecommendationEngine, Recommendation } from '@/services/RecommendationEngine';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Enhanced AI Assistant Types
export interface AIMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  type?: 'default' | 'navigation' | 'suggestion' | 'help' | 'route' | 'workflow' | 'next_action' | 'optimization';
  error?: {
    message: string;
    code?: string;
  };
}

// Application Knowledge Base
const APPLICATION_KNOWLEDGE_BASE = {
  routes: {
    '/dashboard': {
      name: 'Dashboard',
      description: 'Overview of your business metrics and key performance indicators',
      actions: ['View financial summary', 'Quick access to recent activities']
    },
    '/dashboard/my-company': {
      name: 'My Company',
      description: 'Manage company details, users, and permissions',
      actions: ['Edit company information', 'Manage user access', 'View company settings']
    },
    '/dashboard/clients': {
      name: 'Clients',
      description: 'Manage and track client information and interactions',
      actions: ['Add new client', 'View client list', 'Generate client reports']
    },
    '/dashboard/invoices': {
      name: 'Invoices & Quotes',
      description: 'Create, manage, and track invoices and quotes',
      actions: ['Generate new invoice', 'Create quote', 'View invoice history']
    }
  },
  features: {
    'user-management': {
      description: 'Comprehensive user management system',
      capabilities: [
        'Add/remove users',
        'Set user permissions',
        'Manage access levels',
        'Track user activities'
      ]
    },
    'financial-tracking': {
      description: 'Advanced financial tracking and reporting',
      capabilities: [
        'Generate financial reports',
        'Track income and expenses',
        'Create invoices and quotes',
        'Manage payments'
      ]
    }
  }
};

// Export the knowledge base
export { APPLICATION_KNOWLEDGE_BASE };

// Enhanced error tracking and logging utility
const errorTracker = {
  logError: (
    error: Error | unknown, 
    context: Record<string, unknown> = {}, 
    severity: 'low' | 'medium' | 'high' = 'medium'
  ) => {
    // Ensure we have an Error object
    const processedError = error instanceof Error 
      ? error 
      : new Error(JSON.stringify(error));

    const errorId = `err-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const errorLog = {
      id: errorId,
      message: processedError.message,
      name: processedError.name,
      stack: processedError.stack,
      timestamp: new Date().toISOString(),
      severity,
      context: {
        ...context,
        userAgent: navigator.userAgent,
        url: window.location.href
      }
    };

    // Log to console
    console.error('AI Assistant Error:', errorLog);

    // Optional: Send to external error tracking service
    // externalErrorTrackingService.send(errorLog);

    return errorLog;
  },

  // Determine error severity based on error characteristics
  determineSeverity: (error: Error): 'low' | 'medium' | 'high' => {
    const criticalErrors = [
      'UnauthorizedError', 
      'ForbiddenError', 
      'NetworkError'
    ];

    if (criticalErrors.includes(error.name)) {
      return 'high';
    }

    return error.message.includes('timeout') ? 'medium' : 'low';
  }
};

// AI Assistant Context Type with more robust error handling
interface AIAssistantContextType {
  messages: AIMessage[];
  isLoading: boolean;
  sendMessage: (message: string) => Promise<void>;
  clearConversation: () => void;
  getContextualHelp: (route?: string) => string;
  getRecommendations: () => {
    workflow: Recommendation | null;
    nextAction: Recommendation | null;
    performance: Recommendation | null;
  };
}

const AIAssistantContext = createContext<AIAssistantContextType | undefined>(undefined);

// Error Boundary Component
class AIAssistantErrorBoundary extends Component<
  { children: ReactNode }, 
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error
    console.error('AI Assistant Error:', {
      error,
      errorInfo,
      timestamp: new Date().toISOString(),
      context: {
        component: 'AIAssistantProvider',
        location: window.location.href
      }
    });

    // Optional: Send to error tracking service
    // errorTrackingService.logError(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  }

  render() {
    if (this.state.hasError) {
      return (
        <Card className="bg-red-50 border-red-200 max-w-md mx-auto mt-10">
          <CardHeader>
            <CardTitle className="flex items-center text-red-700">
              <AlertTriangle className="mr-2" /> AI Assistant Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-red-600">
                The AI Assistant encountered an unexpected error.
              </p>
              {this.state.error && (
                <pre className="bg-red-100 p-2 rounded text-xs text-red-800">
                  {this.state.error.toString()}
                </pre>
              )}
              <div className="flex space-x-2">
                <Button 
                  variant="destructive" 
                  onClick={this.handleReset}
                >
                  Reset AI Assistant
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => window.location.reload()}
                >
                  Reload Page
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

export const AIAssistantProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const { getUserActionHistory: getUserBehaviorHistory } = useUserBehavior();
  const recommendationEngine = RecommendationEngine.getInstance();

  // Enhanced AI Response Generation with Comprehensive Error Handling
  const generateAIResponse = async (userMessage: string): Promise<AIMessage> => {
    try {
      // Validate input
      if (!userMessage || userMessage.trim().length === 0) {
        throw new Error('Empty message is not allowed');
      }

      // Get user action history with error handling
      let actionHistory;
      try {
        actionHistory = getUserBehaviorHistory();
      } catch (historyError) {
        errorTracker.logError(historyError as Error, {
          context: 'User Action History Retrieval',
          userMessage
        }, 'low');
        actionHistory = []; // Fallback to empty history
      }

      // Detect workflow progression with improved error handling
      let workflowRecommendation;
      try {
        workflowRecommendation = recommendationEngine.detectWorkflowProgression(actionHistory);
      } catch (workflowError) {
        errorTracker.logError(workflowError as Error, {
          context: 'Workflow Recommendation',
          userMessage
        }, 'low');
        workflowRecommendation = null;
      }

      // If workflow recommendation exists, return it
      if (workflowRecommendation) {
        return {
          id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          content: `${workflowRecommendation.description}. I recommend: ${workflowRecommendation.suggestedRoute || 'Next Action'}`,
          sender: 'ai',
          timestamp: new Date(),
          type: workflowRecommendation.type === 'workflow' ? 'workflow' : 'suggestion'
        };
      }

      // Fallback response
      return {
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        content: "I'm here to help! What can I assist you with today?",
        sender: 'ai',
        timestamp: new Date(),
        type: 'default'
      };

    } catch (error) {
      // Comprehensive error logging
      const trackedError = errorTracker.logError(
        error as Error, 
        { 
          context: 'AI Response Generation', 
          userMessage, 
          location: window.location.pathname 
        }, 
        errorTracker.determineSeverity(error as Error)
      );

      // Return an error message that can be displayed
      return {
        id: trackedError.id,
        content: "I'm experiencing some difficulties. Please try again later.",
        sender: 'ai',
        timestamp: new Date(),
        type: 'default',
        error: {
          message: (error as Error).message,
          code: trackedError.id
        }
      };
    }
  };

  // Message sending with comprehensive error handling
  const sendMessage = useCallback(async (userMessage: string) => {
    // Authentication check
    if (!currentUser) {
      toast({
        title: "Authentication Required",
        description: "Please log in to use the AI Assistant",
        variant: "destructive"
      });
      return;
    }

    // Add user message
    const userMessageObj: AIMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      content: userMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prevMessages => [...prevMessages, userMessageObj]);
    setIsLoading(true);

    try {
      // Generate AI response with error tracking
      const aiMessageObj = await generateAIResponse(userMessage);
      
      // Handle potential errors in AI response
      if (aiMessageObj.error) {
        toast({
          title: "AI Assistant Encountered an Issue",
          description: aiMessageObj.error.message,
          variant: "destructive"
        });
      }

      setMessages(prevMessages => [...prevMessages, aiMessageObj]);
    } catch (error) {
      // Unexpected error in message sending
      errorTracker.logError(error as Error, {
        context: 'Message Sending',
        userMessage
      }, 'high');

      toast({
        title: "AI Assistant Error",
        description: "Unable to send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, toast]);

  // Context value with error-resilient methods
  const contextValue = useMemo(() => ({
    messages,
    isLoading,
    sendMessage,
    clearConversation: () => setMessages([]),
    getContextualHelp: (route?: string) => {
      const currentRoute = route || window.location.pathname;
      const routeInfo = APPLICATION_KNOWLEDGE_BASE.routes[currentRoute];
      
      return routeInfo 
        ? `${routeInfo.description}\n\nQuick Actions:\n${routeInfo.actions.map(action => `• ${action}`).join('\n')}`
        : "No specific help available for this page.";
    },
    getRecommendations: () => {
      const actionHistory = getUserBehaviorHistory();
      return {
        workflow: recommendationEngine.detectWorkflowProgression(actionHistory),
        nextAction: recommendationEngine.predictNextAction(actionHistory),
        performance: recommendationEngine.analyzePerformance(actionHistory)
      };
    }
  }), [messages, isLoading, sendMessage]);

  // Error boundary with custom error handling
  return (
    <AIAssistantErrorBoundary>
      <AIAssistantContext.Provider value={contextValue}>
        {children}
      </AIAssistantContext.Provider>
    </AIAssistantErrorBoundary>
  );
};

export const useAIAssistant = () => {
  const context = useContext(AIAssistantContext);
  if (context === undefined) {
    throw new Error('useAIAssistant must be used within an AIAssistantProvider');
  }
  return context;
};
