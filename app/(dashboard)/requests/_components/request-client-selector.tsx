/**
 * REQUEST CLIENT SELECTOR
 * 
 * Purpose:
 * Select client and optional property for request
 */

'use client';

import { Users, Home } from 'lucide-react';
import { CustomSelect } from '@/ui/components/custom-select';
import { getClientDisplayName } from '@/lib/client-utils';

interface Client {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  companyName?: string | null;
  properties: { id: string; address: string }[];
}

interface RequestClientSelectorProps {
  clients: Client[];
  selectedClientId: string;
  selectedPropertyId: string;
  onClientChange: (clientId: string) => void;
  onPropertyChange: (propertyId: string) => void;
  disabled?: boolean;
}

export function RequestClientSelector({
  clients,
  selectedClientId,
  selectedPropertyId,
  onClientChange,
  onPropertyChange,
  disabled = false,
}: RequestClientSelectorProps) {
  const selectedClient = clients.find(c => c.id === selectedClientId);

  return (
    <div className="bg-brand-bg rounded-xl shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
        <Users className="w-5 h-5 mr-2 text-brand" />
        Client Information
      </h2>

      <div className="space-y-4">
        {/* Client Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Client <span className="text-red-500">*</span>
          </label>
          <CustomSelect
            value={selectedClientId}
            onChange={(clientId) => {
              onClientChange(clientId);
              onPropertyChange(''); // Reset property when client changes
            }}
            disabled={disabled}
            options={[
              { value: '', label: 'Select a client...' },
              ...clients.map(client => ({
                value: client.id,
                label: getClientDisplayName(client),
              })),
            ]}
            placeholder="Choose a client"
          />
        </div>

        {/* Property Selection */}
        {selectedClient && selectedClient.properties.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
              <Home className="w-4 h-4 mr-2" />
              Property (Optional)
            </label>
            <CustomSelect
              value={selectedPropertyId}
              onChange={onPropertyChange}
              disabled={disabled}
              options={[
                { value: '', label: 'No specific property' },
                ...selectedClient.properties.map(prop => ({
                  value: prop.id,
                  label: prop.address,
                })),
              ]}
              placeholder="Select property (optional)"
            />
          </div>
        )}
      </div>
    </div>
  );
}

