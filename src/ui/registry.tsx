import React from 'react';

export interface FieldProps {
  name: string;
  value: any;
  onChange: (value: any) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
}

export interface FieldConfig {
  name: string;
  type: string;
  label: string;
  required?: boolean;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
}

// Field component registry
export const fieldComponents = {
  title: ({ value, onChange, error, required, placeholder }: FieldProps) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Job Title {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type="text"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || 'Enter job title'}
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  ),

  clientId: ({ value, onChange, error, required, placeholder, options }: FieldProps & { options?: any[] }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Client {required && <span className="text-red-500">*</span>}
      </label>
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
      >
        <option value="">{placeholder || 'Select a client'}</option>
        {options?.map((option) => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  ),

  scheduledAt: ({ value, onChange, error, required }: FieldProps) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Scheduled Date {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type="datetime-local"
        value={value ? new Date(value).toISOString().slice(0, 16) : ''}
        onChange={(e) => onChange(e.target.value ? new Date(e.target.value) : null)}
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  ),

  assignees: ({ value, onChange, error, placeholder }: FieldProps) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Assignees
      </label>
      <textarea
        value={Array.isArray(value) ? value.join(', ') : value || ''}
        onChange={(e) => onChange(e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
        placeholder={placeholder || 'Enter assignee names separated by commas'}
        rows={2}
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  ),

  'custom.squareFootage': ({ value, onChange, error }: FieldProps) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Square Footage
      </label>
      <input
        type="number"
        value={value || ''}
        onChange={(e) => onChange(Number(e.target.value) || null)}
        placeholder="Enter square footage"
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  ),

  'custom.floorType': ({ value, onChange, error }: FieldProps) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Floor Type
      </label>
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
      >
        <option value="">Select floor type</option>
        <option value="hardwood">Hardwood</option>
        <option value="carpet">Carpet</option>
        <option value="tile">Tile</option>
        <option value="laminate">Laminate</option>
        <option value="vinyl">Vinyl</option>
        <option value="mixed">Mixed</option>
      </select>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  ),

  'custom.petNotes': ({ value, onChange, error }: FieldProps) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Pet Notes
      </label>
      <textarea
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Any notes about pets (allergies, special care, etc.)"
        rows={3}
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  ),
};

// Helper function to render a field based on its name
export function renderField(
  fieldName: string, 
  props: FieldProps & { options?: any[] }
): React.ReactElement | null {
  const FieldComponent = fieldComponents[fieldName as keyof typeof fieldComponents];
  
  if (!FieldComponent) {
    // Fallback to text input for unknown fields
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {fieldName} {props.required && <span className="text-red-500">*</span>}
        </label>
        <input
          type="text"
          value={props.value || ''}
          onChange={(e) => props.onChange(e.target.value)}
          placeholder={props.placeholder || `Enter ${fieldName}`}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            props.error ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {props.error && <p className="mt-1 text-sm text-red-600">{props.error}</p>}
      </div>
    );
  }
  
  return <FieldComponent {...props} />;
}

