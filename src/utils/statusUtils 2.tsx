import React from 'react';
import { Badge } from '@/components/ui/badge';

type StatusBadgeProps = {
  status: string;
  extraClassName?: string;
};

/**
 * Maps different status values to appropriate Badge components with variant and styling
 * @param status - The status string to display
 * @param extraClassName - Optional additional class names to apply to the Badge
 * @returns A Badge component styled according to the status
 */
export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  extraClassName = '' 
}) => {
  // Handle undefined or null status
  if (!status) {
    return <Badge variant="outline" className={extraClassName}>Unknown</Badge>;
  }
  
  // Normalize the status to lowercase for case-insensitive comparison
  const normalizedStatus = status.toLowerCase();
  
  switch (normalizedStatus) {
    // Quote statuses
    case 'draft':
      return <Badge variant="secondary" className={extraClassName}>Draft</Badge>;
    case 'sent':
      return <Badge variant="secondary" className={extraClassName}>Sent</Badge>;
    case 'accepted':
      return <Badge className={`bg-green-100 text-green-800 hover:bg-green-200 ${extraClassName}`}>Accepted</Badge>;
    case 'declined':
      return <Badge variant="destructive" className={extraClassName}>Declined</Badge>;
    case 'expired':
      return <Badge variant="outline" className={`text-orange-800 ${extraClassName}`}>Expired</Badge>;
    
    // Invoice statuses
    case 'paid':
      return <Badge variant="credit" className={extraClassName}>Paid</Badge>;
    case 'overdue':
      return <Badge variant="overdue" className={extraClassName}>Overdue</Badge>;
    case 'outstanding':
      return <Badge variant="outstanding" className={extraClassName}>Outstanding</Badge>;
    case 'partially paid':
      return <Badge className={`bg-blue-100 text-blue-800 hover:bg-blue-200 ${extraClassName}`}>Partially Paid</Badge>;
    
    // Client statuses
    case 'active':
      return <Badge variant="client" className={extraClassName}>Active</Badge>;
    case 'inactive':
      return <Badge variant="outline" className={`text-gray-500 ${extraClassName}`}>Inactive</Badge>;
    
    // Inventory statuses
    case 'in stock':
      return <Badge variant="credit" className={extraClassName}>In Stock</Badge>;
    case 'low stock':
      return <Badge variant="outstanding" className={extraClassName}>Low Stock</Badge>;
    case 'out of stock':
      return <Badge variant="destructive" className={extraClassName}>Out of Stock</Badge>;
    case 'discontinued':
      return <Badge variant="outline" className={`text-gray-500 ${extraClassName}`}>Discontinued</Badge>;
    
    // Payment statuses
    case 'pending':
      return <Badge variant="outstanding" className={extraClassName}>Pending</Badge>;
    case 'processing':
      return <Badge className={`bg-purple-100 text-purple-800 hover:bg-purple-200 ${extraClassName}`}>Processing</Badge>;
    case 'completed':
      return <Badge variant="credit" className={extraClassName}>Completed</Badge>;
    case 'failed':
      return <Badge variant="destructive" className={extraClassName}>Failed</Badge>;
    case 'refunded':
      return <Badge className={`bg-indigo-100 text-indigo-800 hover:bg-indigo-200 ${extraClassName}`}>Refunded</Badge>;
    
    // Default fallback
    default:
      return <Badge variant="outline" className={extraClassName}>{status}</Badge>;
  }
};

/**
 * Get color class based on status - useful for text, borders or other styling
 * when not using the Badge component
 * @param status - The status string
 * @returns A string containing tailwind color classes
 */
export const getStatusColor = (status: string): string => {
  const normalizedStatus = status.toLowerCase();
  
  switch (normalizedStatus) {
    case 'draft':
    case 'sent':
      return 'text-gray-600';
    case 'accepted':
    case 'paid':
    case 'in stock':
    case 'completed':
    case 'active':
      return 'text-green-600';
    case 'declined':
    case 'overdue':
    case 'out of stock':
    case 'failed':
      return 'text-red-600';
    case 'outstanding':
    case 'low stock':
    case 'pending':
      return 'text-yellow-600';
    case 'partially paid':
    case 'processing':
      return 'text-blue-600';
    case 'inactive':
    case 'discontinued':
      return 'text-gray-400';
    case 'expired':
      return 'text-orange-600';
    case 'refunded':
      return 'text-indigo-600';
    default:
      return 'text-gray-600';
  }
};
