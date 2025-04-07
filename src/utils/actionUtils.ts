
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
      toast({
        title: `${type.charAt(0).toUpperCase() + type.slice(1)} status updated`,
        description: `The ${type} has been updated to ${status}.`
      });
      if (callbacks?.onSuccess) {
        callbacks.onSuccess();
      }
      return true;
    } else {
      throw new Error("Random failure for testing purposes");
    }
  } catch (error) {
    console.error(`Error changing ${type} status:`, error);
    toast({
      title: `Failed to update ${type} status`,
      description: `There was an error updating the ${type} to ${status}.`,
      variant: "destructive"
    });
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
      toast({
        title: "Benefit plan added",
        description: `${benefitData.name} plan has been successfully added.`,
        variant: "success"
      });
      
      if (callbacks?.onSuccess) {
        callbacks.onSuccess();
      }
      return true;
    } else {
      // Instead of throwing, we'll handle the error directly
      console.error("Simulated API failure for testing");
      toast({
        title: "Failed to add benefit plan",
        description: "There was an error adding the new benefit plan. Please try again.",
        variant: "destructive"
      });
      
      if (callbacks?.onError) {
        callbacks.onError();
      }
      return false;
    }
  } catch (error) {
    console.error("Error adding benefit plan:", error);
    toast({
      title: "Failed to add benefit plan",
      description: "There was an error adding the new benefit plan. Please try again.",
      variant: "destructive"
    });
    
    if (callbacks?.onError) {
      callbacks.onError();
    }
    return false;
  }
};

// Updated action functions for Invoices and Quotes with proper parameters
export const downloadAction = async (
  id: string, 
  type: "invoice" | "quote"
): Promise<boolean> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  try {
    console.log(`Downloading ${type} ${id}`);
    toast({
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} downloaded`,
      description: `${type.charAt(0).toUpperCase() + type.slice(1)} ${id} has been downloaded.`
    });
    return true;
  } catch (error) {
    console.error(`Error downloading ${type}:`, error);
    toast({
      title: `Download failed`,
      description: `Failed to download ${type} ${id}.`,
      variant: "destructive"
    });
    return false;
  }
};

export const emailAction = async (
  id: string, 
  type: "invoice" | "quote"
): Promise<boolean> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  try {
    console.log(`Emailing ${type} ${id}`);
    toast({
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} emailed`,
      description: `${type.charAt(0).toUpperCase() + type.slice(1)} ${id} has been sent via email.`
    });
    return true;
  } catch (error) {
    console.error(`Error emailing ${type}:`, error);
    toast({
      title: `Email failed`,
      description: `Failed to email ${type} ${id}.`,
      variant: "destructive"
    });
    return false;
  }
};

export const deleteAction = async (
  id: string, 
  type: "invoice" | "quote"
): Promise<boolean> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 600));
  
  try {
    console.log(`Deleting ${type} ${id}`);
    toast({
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} deleted`,
      description: `${type.charAt(0).toUpperCase() + type.slice(1)} ${id} has been deleted.`
    });
    return true;
  } catch (error) {
    console.error(`Error deleting ${type}:`, error);
    toast({
      title: `Delete failed`,
      description: `Failed to delete ${type} ${id}.`,
      variant: "destructive"
    });
    return false;
  }
};

export const convertAction = async (
  id: string, 
  fromType: "quote",
  toType: "invoice",
  callbacks?: ActionCallbacks
): Promise<boolean> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1200));
  
  try {
    console.log(`Converting ${fromType} ${id} to ${toType}`);
    toast({
      title: `${fromType.charAt(0).toUpperCase() + fromType.slice(1)} converted`,
      description: `${fromType.charAt(0).toUpperCase() + fromType.slice(1)} ${id} has been converted to ${toType}.`
    });
    if (callbacks?.onSuccess) {
      callbacks.onSuccess();
    }
    return true;
  } catch (error) {
    console.error(`Error converting ${fromType} to ${toType}:`, error);
    toast({
      title: `Conversion failed`,
      description: `Failed to convert ${fromType} ${id} to ${toType}.`,
      variant: "destructive"
    });
    if (callbacks?.onError) {
      callbacks.onError();
    }
    return false;
  }
};

export const handleAction = async (
  actionName: string,
  actionFn: () => Promise<void>
): Promise<boolean> => {
  try {
    await actionFn();
    return true;
  } catch (error) {
    console.error(`Error handling ${actionName} action:`, error);
    toast({
      title: `Action failed`,
      description: `Failed to ${actionName.toLowerCase()}.`,
      variant: "destructive"
    });
    return false;
  }
};
