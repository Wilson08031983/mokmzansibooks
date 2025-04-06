
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Save, Edit, Trash, FileSpreadsheet, Plus, Calendar } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

export interface Template {
  id: string;
  name: string;
  category: string;
  fields: Record<string, string>;
  lastUsed: string;
  createdAt: string;
}

interface FormTemplateProps {
  templates: Template[];
  onSaveTemplate: (template: Omit<Template, 'id' | 'createdAt' | 'lastUsed'>) => void;
  onDeleteTemplate: (templateId: string) => void;
  onApplyTemplate: (template: Template, updateDates: boolean) => void;
  currentFormFields: Record<string, string>;
}

const FormTemplate: React.FC<FormTemplateProps> = ({
  templates,
  onSaveTemplate,
  onDeleteTemplate,
  onApplyTemplate,
  currentFormFields,
}) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateCategory, setNewTemplateCategory] = useState('general');
  const [updateDates, setUpdateDates] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  
  const handleSaveTemplate = () => {
    if (!newTemplateName.trim()) {
      toast.error('Please enter a template name');
      return;
    }
    
    onSaveTemplate({
      name: newTemplateName,
      category: newTemplateCategory,
      fields: currentFormFields,
    });
    
    setNewTemplateName('');
    setNewTemplateCategory('general');
    setIsCreateDialogOpen(false);
    toast.success('Template saved successfully');
  };
  
  const handleApplyTemplate = (template: Template) => {
    setSelectedTemplate(template);
    onApplyTemplate(template, updateDates);
    toast.success(`Template "${template.name}" applied`);
  };
  
  const handleDeleteTemplate = (templateId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this template?')) {
      onDeleteTemplate(templateId);
      if (selectedTemplate?.id === templateId) {
        setSelectedTemplate(null);
      }
      toast.success('Template deleted');
    }
  };
  
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch {
      return 'Unknown date';
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Form Templates</h3>
        <Button 
          onClick={() => setIsCreateDialogOpen(true)}
          variant="outline" 
          size="sm"
        >
          <Plus className="h-4 w-4 mr-1" />
          Save Current as Template
        </Button>
      </div>
      
      <div className="flex items-center space-x-2 mb-4">
        <Switch
          id="update-dates"
          checked={updateDates}
          onCheckedChange={setUpdateDates}
        />
        <Label htmlFor="update-dates" className="text-sm">
          Automatically update dates when applying templates
        </Label>
      </div>
      
      {templates.length === 0 ? (
        <div className="text-center py-8 border border-dashed rounded-lg">
          <FileSpreadsheet className="h-10 w-10 mx-auto text-gray-400 mb-3" />
          <p className="text-gray-500">No templates saved yet</p>
          <p className="text-sm text-gray-400 mt-1">
            Save your current form as a template to reuse later
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {templates.map((template) => (
            <Card 
              key={template.id} 
              className={`cursor-pointer hover:border-indigo-300 transition-colors ${
                selectedTemplate?.id === template.id ? 'border-indigo-500 bg-indigo-50' : ''
              }`}
              onClick={() => handleApplyTemplate(template)}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-base">{template.name}</CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0" 
                    onClick={(e) => handleDeleteTemplate(template.id, e)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
                <Badge variant="outline" className="mt-1">
                  {template.category}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-gray-500 flex items-center mt-2">
                  <Calendar className="h-3 w-3 mr-1" />
                  Last used: {formatDate(template.lastUsed)}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {Object.keys(template.fields).length} fields
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save as Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="template-name">Template Name</Label>
              <Input
                id="template-name"
                value={newTemplateName}
                onChange={(e) => setNewTemplateName(e.target.value)}
                placeholder="e.g., Tax Form 2023"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="template-category">Category</Label>
              <Input
                id="template-category"
                value={newTemplateCategory}
                onChange={(e) => setNewTemplateCategory(e.target.value)}
                placeholder="e.g., tax, tender, registration"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveTemplate}>
              <Save className="h-4 w-4 mr-2" />
              Save Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FormTemplate;
