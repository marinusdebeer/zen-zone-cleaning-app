/**
 * ESTIMATE RECIPIENT SELECTOR
 * 
 * Purpose:
 * Select recipient for estimate - shows all clients and leads in one selector
 * Includes property selection for all clients
 */

'use client';

import { Users } from 'lucide-react';
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
  properties?: {
    id: string;
    address: string;
  }[];
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
  // Find the selected entity (could be in either list)
  const selectedClient = clients.find(c => c.id === selectedClientId);
  const selectedLead = leads.find(l => l.id === selectedClientId);
  const selectedEntity = selectedClient || selectedLead;
  const isLead = !!selectedLead;

  // Get properties from the selected entity
  const availableProperties = selectedEntity?.properties || [];

  // Combine clients and leads into one list with badges
  const allClientOptions = [
    { value: '', label: 'Select a client or lead...' },
    ...clients.map(client => ({ 
      value: client.id, 
      label: client.name,
      badge: 'Client'
    })),
    ...leads.map(lead => ({ 
      value: lead.id, 
      label: `${lead.name}${lead.emails[0] ? ` (${lead.emails[0]})` : ''}`,
      badge: 'Lead'
    }))
  ];

  const handleClientChange = (clientId: string) => {
    // Determine if selected is a lead or client
    const isSelectedLead = leads.some(l => l.id === clientId);
    onTypeChange(isSelectedLead ? 'lead' : 'client');
    onClientChange(clientId);
  };

  return (
    <div className="bg-brand-bg rounded-xl shadow-sm p-6">
      <h2 className="text-lg font-semibold mb-4 flex items-center text-gray-900 dark:text-white">
        <Users className="w-5 h-5 mr-2 text-brand" />
        Recipient
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Client <span className="text-red-500">*</span>
          </label>
          <CustomSelect
            value={selectedClientId}
            onChange={handleClientChange}
            disabled={disabled}
            options={allClientOptions}
            placeholder="Select a client..."
            showBadges={true}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Property <span className="text-gray-400 text-xs">(optional)</span>
          </label>
          <CustomSelect
            value={selectedPropertyId}
            onChange={onPropertyChange}
            disabled={disabled || !selectedEntity || availableProperties.length === 0}
            options={[
              { value: '', label: 'Select a property...' },
              ...availableProperties.map(property => ({ 
                value: property.id, 
                label: property.address 
              }))
            ]}
            placeholder={
              !selectedEntity ? 'Select a client first' :
              availableProperties.length === 0 ? 'No properties available' :
              'Select a property...'
            }
          />
          {selectedEntity && availableProperties.length === 0 && (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">No properties on file for this client</p>
          )}
          {!selectedEntity && (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Select a client first</p>
          )}
        </div>
      </div>
    </div>
  );
}

