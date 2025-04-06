
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PlusCircle, Trash, MoveUp, MoveDown, Save } from 'lucide-react';
import { toast } from 'sonner';
import FormField from './FormField';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export interface FormFieldConfig {
  id: string;
  label: string;
  type: 'text' | 'email' | 'number' | 'date' | 'tel' | 'url';
  placeholder?: string;
  required?: boolean;
  defaultValue?: string;
}

interface FormBuilderProps {
  formFields: FormFieldConfig[];
  onSave: (fields: FormFieldConfig[]) => void;
}

const FormBuilder: React.FC<FormBuilderProps> = ({ formFields: initialFields, onSave }) => {
  const [formFields, setFormFields] = useState<FormFieldConfig[]>(initialFields);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    if (!editMode) {
      setFormFields(initialFields);
    }
  }, [initialFields, editMode]);

  const addField = () => {
    const newField: FormFieldConfig = {
      id: `field_${Date.now()}`,
      label: 'New Field',
      type: 'text',
      placeholder: 'Enter value',
      required: false,
      defaultValue: '',
    };
    setFormFields([...formFields, newField]);
  };

  const removeField = (id: string) => {
    setFormFields(formFields.filter(field => field.id !== id));
  };

  const updateField = (id: string, updates: Partial<FormFieldConfig>) => {
    setFormFields(formFields.map(field => 
      field.id === id ? { ...field, ...updates } : field
    ));
  };

  const moveField = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === formFields.length - 1)
    ) {
      return;
    }

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const newFields = [...formFields];
    [newFields[index], newFields[newIndex]] = [newFields[newIndex], newFields[index]];
    setFormFields(newFields);
  };

  const handleSave = () => {
    onSave(formFields);
    setEditMode(false);
    toast.success('Form structure saved');
  };

  if (!editMode) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Form Structure</h3>
          <Button onClick={() => setEditMode(true)} variant="outline" size="sm">
            Edit Form
          </Button>
        </div>
        <div className="space-y-4">
          {formFields.map((field) => (
            <div key={field.id} className="p-3 border rounded-md bg-gray-50">
              <p className="font-medium">{field.label} {field.required && <span className="text-red-500">*</span>}</p>
              <p className="text-sm text-gray-500 mt-1">Type: {field.type}</p>
              {field.placeholder && <p className="text-sm text-gray-500">Placeholder: {field.placeholder}</p>}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Edit Form Structure</h3>
        <div className="space-x-2">
          <Button onClick={() => setEditMode(false)} variant="outline" size="sm">
            Cancel
          </Button>
          <Button onClick={handleSave} variant="default" size="sm">
            <Save className="h-4 w-4 mr-1" />
            Save Form
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {formFields.map((field, index) => (
          <Card key={field.id} className="relative border">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`field-label-${field.id}`}>Field Label</Label>
                  <Input
                    id={`field-label-${field.id}`}
                    value={field.label}
                    onChange={(e) => updateField(field.id, { label: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`field-type-${field.id}`}>Field Type</Label>
                  <Select
                    value={field.type}
                    onValueChange={(value) => updateField(field.id, { 
                      type: value as 'text' | 'email' | 'number' | 'date' | 'tel' | 'url'
                    })}
                  >
                    <SelectTrigger id={`field-type-${field.id}`}>
                      <SelectValue placeholder="Select field type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="number">Number</SelectItem>
                      <SelectItem value="date">Date</SelectItem>
                      <SelectItem value="tel">Telephone</SelectItem>
                      <SelectItem value="url">URL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`field-placeholder-${field.id}`}>Placeholder</Label>
                  <Input
                    id={`field-placeholder-${field.id}`}
                    value={field.placeholder || ''}
                    onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`field-default-${field.id}`}>Default Value</Label>
                  <Input
                    id={`field-default-${field.id}`}
                    value={field.defaultValue || ''}
                    onChange={(e) => updateField(field.id, { defaultValue: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex items-center mt-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={field.required || false}
                    onChange={(e) => updateField(field.id, { required: e.target.checked })}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Required Field</span>
                </label>

                <div className="ml-auto space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => moveField(index, 'up')}
                    disabled={index === 0}
                  >
                    <MoveUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => moveField(index, 'down')}
                    disabled={index === formFields.length - 1}
                  >
                    <MoveDown className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => removeField(field.id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button onClick={addField} variant="outline" className="w-full">
        <PlusCircle className="h-4 w-4 mr-2" /> Add New Field
      </Button>
    </div>
  );
};

export default FormBuilder;
