import React, { ReactNode } from 'react';

interface A4SheetProps {
  children: ReactNode;
  backgroundImage?: string;
  className?: string;
  printable?: boolean;
  id?: string;
}

/**
 * A4Sheet component - Creates a standard A4 sized container for documents
 * Used as the base for invoices, quotes, and other printable documents
 */
const A4Sheet: React.FC<A4SheetProps> = ({ 
  children, 
  backgroundImage, 
  className = '', 
  printable = true,
  id 
}) => {
  // A4 dimensions in mm (210 x 297)
  // We convert to pixels - standard print resolution is 96 DPI (dots per inch)
  // 1 inch = 25.4 mm, so we have 210/25.4*96 = 793 pixels for width
  // and 297/25.4*96 = 1122 pixels for height
  
  return (
    <div
      id={id}
      className={`relative bg-white ${className} ${printable ? 'print:shadow-none' : ''}`}
      style={{
        width: '210mm',
        height: '297mm',
        margin: '0 auto',
        padding: '0',
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        pageBreakAfter: 'always',
        background: backgroundImage ? `url(${backgroundImage}) no-repeat center/cover` : 'white',
      }}
    >
      <div 
        className="relative w-full h-full"
        style={{
          padding: '10mm', 
          boxSizing: 'border-box',
          zIndex: 10,
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default A4Sheet;
