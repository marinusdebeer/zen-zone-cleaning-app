/**
 * ESTIMATE RECIPIENT SELECTOR
 * 
 * Purpose:
 * Select recipient for estimate - either existing client or lead
 * Includes property selection for clients
 */

'use client';

import { Users, UserPlus } from 'lucide-react';
import { CustomSelect } from '@/ui/components/custom-select';

interface Client {
  id: string;
  name: string;
  properties: {
    id: string;
    address: string;
  }[];
}

interface Lead {
  id: string;
  name: string;
  emails: string[];
}

interface EstimateRecipientSelectorProps {
  clients: Client[];
  leads: Lead[];
  forType: 'client' | 'lead';
  selectedClientId: string;
  selectedPropertyId: string;
  onTypeChange: (type: 'client' | 'lead') => void;
  onClientChange: (clientId: string) => void;
  onPropertyChange: (propertyId: string) => void;
  disabled?: boolean;
}

export function EstimateRecipientSelector({
  clients,
  leads,
  forType,
  selectedClientId,
  selectedPropertyId,
  onTypeChange,
  onClientChange,
  onPropertyChange,
  disabled = false,
}: EstimateRecipientSelectorProps) {
  const selectedClient = clients.find(c => c.id === selectedClientId);

  return (
    <div className="bg-brand-bg rounded-xl shadow-sm p-6">
      <h2 className="text-lg font-semibold mb-4 flex items-center text-gray-900 dark:text-white">
        <Users className="w-5 h-5 mr-2 text-brand" />
        Recipient
      </h2>
      
      <div className="space-y-4">
        {/* Toggle between Client/Lead */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => onTypeChange('client')}
            disabled={disabled}
            className={`flex-1 p-4 rounded-lg border-2 transition-colors disabled:opacity-50 ${
              forType === 'client'
                ? 'bg-brand-bg-tertiary border-brand'
                : 'bg-brand-bg border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <Users className="w-5 h-5 mx-auto mb-2 text-brand" />
            <p className="font-medium text-gray-900 dark:text-white">Existing Client</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">For current clients</p>
          </button>
          <button
            type="button"
            onClick={() => onTypeChange('lead')}
            disabled={disabled}
            className={`flex-1 p-4 rounded-lg border-2 transition-colors disabled:opacity-50 ${
              forType === 'lead'
                ? 'bg-brand-bg-tertiary border-brand'
                : 'bg-brand-bg border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <UserPlus className="w-5 h-5 mx-auto mb-2 text-brand" />
            <p className="font-medium text-gray-900 dark:text-white">Lead</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">For potential clients</p>
          </button>
        </div>

        {/* Client Selection */}
        {forType === 'client' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Client <span className="text-red-500">*</span>
              </label>
              <CustomSelect
                value={selectedClientId}
                onChange={onClientChange}
                disabled={disabled}
                options={[
                  { value: '', label: 'Select a client...' },
                  ...clients.map(client => ({ value: client.id, label: client.name }))
                ]}
                placeholder="Select a client..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Property</label>
              <CustomSelect
                value={selectedPropertyId}
                onChange={onPropertyChange}
                disabled={disabled || !selectedClient}
                options={[
                  { value: '', label: 'Select a property...' },
                  ...(selectedClient?.properties.map(property => ({ 
                    value: property.id, 
                    label: property.address 
                  })) || [])
                ]}
                placeholder="Select a property..."
              />
              {!selectedClient && (
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Select a client first</p>
              )}
            </div>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Lead <span className="text-red-500">*</span>
            </label>
            <CustomSelect
              value={selectedClientId}
              onChange={onClientChange}
              disabled={disabled}
              options={[
                { value: '', label: 'Select a lead...' },
                ...leads.map(lead => ({ 
                  value: lead.id, 
                  label: `${lead.name}${lead.emails[0] ? ` (${lead.emails[0]})` : ' (No email)'}` 
                }))
              ]}
              placeholder="Select a lead..."
            />
          </div>
        )}
      </div>
    </div>
  );
}

