
import { toast } from "@/hooks/use-toast";

interface ActionCallbacks {
  onSuccess?: () => void;
  onError?: () => void;
}

// Simulate API call for changing status
export const changeStatusAction = async (
  id: string,
  type: "invoice" | "quote" | "leave",
  status: string,
  callbacks?: ActionCallbacks
): Promise<boolean> => {
  // Simulate network request
  await new Promise(resolve => setTimeout(resolve, 800));
  
  try {
    // Simulate successful API call (95% success rate)
    if (Math.random() > 0.05) {
      if (callbacks?.onSuccess) {
        callbacks.onSuccess();
      }
      return true;
    } else {
      throw new Error("Random failure for testing purposes");
    }
  } catch (error) {
    console.error(`Error changing ${type} status:`, error);
    if (callbacks?.onError) {
      callbacks.onError();
    }
    return false;
  }
};

// Simulate API call for submitting a leave request with document
export const submitLeaveRequestAction = async (
  formData: FormData,
  callbacks?: ActionCallbacks
): Promise<boolean> => {
  // Simulate network request
  await new Promise(resolve => setTimeout(resolve, 1200));
  
  try {
    // Log the data being sent
    console.log("Submitting leave request:");
    for (const [key, value] of formData.entries()) {
      if (key === 'documentation') {
        const file = value as File;
        console.log(`${key}: ${file.name} (${file.size} bytes)`);
      } else {
        console.log(`${key}: ${value}`);
      }
    }
    
    // Simulate successful API call (95% success rate)
    if (Math.random() > 0.05) {
      if (callbacks?.onSuccess) {
        callbacks.onSuccess();
      }
      return true;
    } else {
      throw new Error("Random failure for testing purposes");
    }
  } catch (error) {
    console.error("Error submitting leave request:", error);
    if (callbacks?.onError) {
      callbacks.onError();
    }
    return false;
  }
};

// Simulate API call for benefits related actions
export const addBenefitPlanAction = async (
  benefitData: Record<string, string>,
  callbacks?: ActionCallbacks
): Promise<boolean> => {
  // Simulate network request
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  try {
    // Log the data being sent
    console.log("Adding new benefit plan:", benefitData);
    
    // Simulate successful API call (95% success rate)
    if (Math.random() > 0.05) {
      if (callbacks?.onSuccess) {
        callbacks.onSuccess();
      }
      return true;
    } else {
      throw new Error("Random failure for testing purposes");
    }
  } catch (error) {
    console.error("Error adding benefit plan:", error);
    if (callbacks?.onError) {
      callbacks.onError();
    }
    return false;
  }
};

// Export missing action functions referenced in Invoices and Quotes
export const downloadAction = async (): Promise<boolean> => true;
export const emailAction = async (): Promise<boolean> => true;
export const deleteAction = async (): Promise<boolean> => true;
export const convertAction = async (): Promise<boolean> => true;
export const handleAction = async (): Promise<boolean> => true;
