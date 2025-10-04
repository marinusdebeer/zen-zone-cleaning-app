/**
 * JOB CLIENT SELECTOR COMPONENT
 * 
 * Purpose:
 * Form section for selecting client and property for a job.
 * Property dropdown updates dynamically based on selected client.
 * 
 * Props:
 * - clients: Array of clients with their properties
 * - selectedClientId: Currently selected client ID
 * - selectedPropertyId: Currently selected property ID
 * - onClientChange: Callback when client changes
 * - onPropertyChange: Callback when property changes
 * - disabled: Disable inputs during submission
 */

'use client';

import { Users } from 'lucide-react';
import { CustomSelect } from '@/ui/components/custom-select';
import { getClientDisplayName } from '@/lib/client-utils';

interface Client {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  companyName?: string | null;
  properties: {
    id: string;
    address: string;
  }[];
}

interface JobClientSelectorProps {
  clients: Client[];
  selectedClientId: string;
  selectedPropertyId: string;
  onClientChange: (clientId: string) => void;
  onPropertyChange: (propertyId: string) => void;
  disabled?: boolean;
}

export function JobClientSelector({
  clients,
  selectedClientId,
  selectedPropertyId,
  onClientChange,
  onPropertyChange,
  disabled
}: JobClientSelectorProps) {
  const selectedClient = clients.find(c => c.id === selectedClientId);

  return (
    <div className="bg-brand-bg rounded-xl shadow-sm p-6 border border-brand-border">
      <h2 className="text-lg font-semibold mb-4 flex items-center text-gray-900 dark:text-white">
        <Users className="w-5 h-5 mr-2 text-brand" />
        Client & Property
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Client <span className="text-red-500">*</span>
          </label>
          <CustomSelect
            value={selectedClientId}
            onChange={(value) => {
              // First reset property, then change client
              if (value !== selectedClientId) {
                onPropertyChange(''); // Reset property when client changes
                onClientChange(value);
              }
            }}
            disabled={disabled}
            options={[
              { value: '', label: 'Select client...' },
              ...clients.map(client => ({ value: client.id, label: getClientDisplayName(client) }))
            ]}
            placeholder="Select client..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Property
          </label>
          <CustomSelect
            value={selectedPropertyId}
            onChange={onPropertyChange}
            disabled={disabled || !selectedClientId}
            options={[
              { value: '', label: 'Select property...' },
              ...(selectedClient?.properties || []).map(prop => ({ 
                value: prop.id, 
                label: prop.address 
              }))
            ]}
            placeholder={!selectedClientId ? 'Select client first' : 'Select property...'}
          />
        </div>
      </div>
    </div>
  );
}

