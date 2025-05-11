import React from "react";

/**
 * Safe fallback implementation of CompanyDisplay component
 * This version eliminates all the complex logic that was causing rendering errors
 */
const CompanyDisplaySafe = ({ company }: any) => {
  // Use only the directly provided props with safe fallbacks
  const displayCompany = company || {
    name: "Your Company",
    address: "Company Address",
    email: "company@example.com",
    phone: "Phone Number"
  };

  return (
    <div className="bg-gray-50 p-4 rounded-md">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-sm font-medium text-gray-500">Name</p>
          <p>{displayCompany.name}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">Email</p>
          <p>{displayCompany.email}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">Address</p>
          <p style={{ whiteSpace: 'pre-line' }}>{displayCompany.address}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">Phone</p>
          <p>{displayCompany.phone}</p>
        </div>
      </div>
    </div>
  );
};

export default CompanyDisplaySafe;
