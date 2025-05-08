import { UserAction } from '@/contexts/UserBehaviorContext';

// Advanced workflow patterns
const WORKFLOW_PATTERNS = {
  invoice_creation: [
    '/dashboard/invoices',
    '/dashboard/invoices/select-template',
    '/dashboard/invoices/new-invoice',
    '/dashboard/clients'
  ],
  user_management: [
    '/dashboard/my-company',
    '/dashboard/hr/employees',
    '/dashboard/hr/new-employee'
  ],
  financial_reporting: [
    '/dashboard/accounting',
    '/dashboard/accounting/reports',
    '/dashboard/reports'
  ]
};

export interface Recommendation {
  type: 'workflow' | 'next_action' | 'optimization';
  confidence: number;
  description: string;
  suggestedRoute?: string;
  details?: Record<string, any>;
}

export class RecommendationEngine {
  private static instance: RecommendationEngine;
  
  private constructor() {}

  public static getInstance(): RecommendationEngine {
    if (!RecommendationEngine.instance) {
      RecommendationEngine.instance = new RecommendationEngine();
    }
    return RecommendationEngine.instance;
  }

  // Detect workflow progression
  detectWorkflowProgression(actionHistory: UserAction[]): Recommendation | null {
    const recentActions = actionHistory.slice(-5);
    
    for (const [workflowName, workflowSteps] of Object.entries(WORKFLOW_PATTERNS)) {
      const matchedWorkflow = this.checkWorkflowMatch(recentActions, workflowSteps);
      
      if (matchedWorkflow) {
        const nextStep = this.predictNextStep(matchedWorkflow, workflowSteps);
        
        return {
          type: 'workflow',
          confidence: 0.85,
          description: `You seem to be in the ${workflowName} workflow`,
          suggestedRoute: nextStep,
          details: {
            workflow: workflowName,
            currentStep: matchedWorkflow
          }
        };
      }
    }
    
    return null;
  }

  // Predict most likely next action
  predictNextAction(actionHistory: UserAction[]): Recommendation | null {
    const lastAction = actionHistory[actionHistory.length - 1];
    
    const contextualSuggestions: Record<string, Recommendation> = {
      '/dashboard/invoices': {
        type: 'next_action',
        confidence: 0.75,
        description: 'Create a new invoice or select a template',
        suggestedRoute: '/dashboard/invoices/new-invoice'
      },
      '/dashboard/my-company': {
        type: 'next_action',
        confidence: 0.7,
        description: 'Manage users or update company details',
        suggestedRoute: '/dashboard/hr/employees'
      },
      '/dashboard/accounting': {
        type: 'next_action',
        confidence: 0.8,
        description: 'Generate financial reports or review transactions',
        suggestedRoute: '/dashboard/accounting/reports'
      }
    };

    return contextualSuggestions[lastAction?.route] || null;
  }

  // Performance optimization recommendations
  analyzePerformance(actionHistory: UserAction[]): Recommendation | null {
    const frequentRoutes = this.calculateRouteFrequency(actionHistory);
    const slowRoutes = Object.entries(frequentRoutes)
      .filter(([_, count]) => count > 10)
      .map(([route]) => route);

    if (slowRoutes.length > 0) {
      return {
        type: 'optimization',
        confidence: 0.6,
        description: 'Some frequently visited pages might benefit from optimization',
        details: {
          frequentRoutes: slowRoutes
        }
      };
    }

    return null;
  }

  private checkWorkflowMatch(actions: UserAction[], workflowSteps: string[]): string | null {
    const actionRoutes = actions.map(action => action.route);
    
    for (const step of workflowSteps) {
      if (actionRoutes.includes(step)) {
        return step;
      }
    }
    
    return null;
  }

  private predictNextStep(currentStep: string, workflowSteps: string[]): string | undefined {
    const currentIndex = workflowSteps.indexOf(currentStep);
    return workflowSteps[currentIndex + 1];
  }

  private calculateRouteFrequency(actionHistory: UserAction[]): Record<string, number> {
    return actionHistory.reduce((freq, action) => {
      freq[action.route] = (freq[action.route] || 0) + 1;
      return freq;
    }, {} as Record<string, number>);
  }
}
