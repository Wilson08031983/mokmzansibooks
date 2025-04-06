
import { toast } from "@/hooks/use-toast";

export interface ActionConfig {
  onSuccess?: (message?: string) => void;
  onError?: (message?: string) => void;
}

export const handleAction = async (
  actionName: string,
  actionFn: () => Promise<any>,
  config: ActionConfig = {}
) => {
  try {
    await actionFn();
    config.onSuccess?.(
      `${actionName} successful`
    );
    return true;
  } catch (error) {
    console.error(`Error during ${actionName}:`, error);
    config.onError?.(
      `${actionName} failed. Please try again.`
    );
    return false;
  }
};

export const downloadAction = async (id: string, type: "invoice" | "quote", config: ActionConfig = {}) => {
  return handleAction(
    `Download ${type}`,
    async () => {
      // Add actual download logic here
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network request
      toast({
        title: "Download started",
        description: `Your ${type} (${id}) will be downloaded shortly.`
      });
    },
    config
  );
};

export const emailAction = async (id: string, type: "invoice" | "quote", config: ActionConfig = {}) => {
  return handleAction(
    `Email ${type}`,
    async () => {
      // Add actual email logic here
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network request
      toast({
        title: "Email sent",
        description: `Your ${type} (${id}) has been emailed successfully.`
      });
    },
    config
  );
};

export const deleteAction = async (id: string, type: "invoice" | "quote", config: ActionConfig = {}) => {
  return handleAction(
    `Delete ${type}`,
    async () => {
      // Add actual delete logic here
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network request
      toast({
        title: "Item deleted",
        description: `${type.charAt(0).toUpperCase() + type.slice(1)} (${id}) has been deleted successfully.`
      });
    },
    config
  );
};

export const convertAction = async (id: string, fromType: "quote", toType: "invoice", config: ActionConfig = {}) => {
  return handleAction(
    `Convert ${fromType} to ${toType}`,
    async () => {
      // Add actual conversion logic here
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network request
      toast({
        title: "Conversion successful",
        description: `${fromType.charAt(0).toUpperCase() + fromType.slice(1)} (${id}) has been converted to ${toType}.`
      });
    },
    config
  );
};

export const changeStatusAction = async (
  id: string, 
  type: "invoice" | "quote", 
  newStatus: string,
  config: ActionConfig = {}
) => {
  return handleAction(
    `Change ${type} status`,
    async () => {
      // Add actual status change logic here
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network request
      toast({
        title: "Status updated",
        description: `${type.charAt(0).toUpperCase() + type.slice(1)} (${id}) status changed to ${newStatus}.`
      });
    },
    config
  );
};
