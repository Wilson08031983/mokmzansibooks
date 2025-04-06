
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

interface FormFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
  labelDescription?: string;
}

const FormField: React.FC<FormFieldProps> = ({
  id,
  label,
  value,
  onChange,
  type = 'text',
  placeholder = '',
  required = false,
  className = '',
  labelDescription,
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <Label htmlFor={id} className="font-medium">
          {label} 
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        {labelDescription && (
          <Badge variant="outline" className="font-normal text-xs">
            {labelDescription}
          </Badge>
        )}
      </div>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full"
      />
    </div>
  );
};

export default FormField;
