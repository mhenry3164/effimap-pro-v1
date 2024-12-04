import { useState, useEffect } from 'react';
import { branchService } from '../services/branchService';
import { representativeService } from '../services/representativeService';
import { useTenant } from './useTenant';
import type { Territory } from '../types/territory';

interface TerritoryDetails {
  name: string;
  displayName: string;  // This will be either branch name or representative name
}

export const useTerritoryDetails = (territory: Territory | null) => {
  const { tenant } = useTenant();
  const [details, setDetails] = useState<TerritoryDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!territory) {
        setDetails(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const tenantId = tenant?.id || 'heavy-machines';

        // Only fetch branch/representative details for system territory types
        if (territory.type === 'branch' && territory.branchId) {
          const branch = await branchService.getById(tenantId, territory.branchId);
          if (branch?.name) {
            setDetails({
              name: territory.name || '',
              displayName: branch.name
            });
            return;
          }
        } else if (territory.type === 'representative' && territory.representativeId) {
          const representative = await representativeService.getById(tenantId, territory.representativeId);
          if (representative?.name) {
            setDetails({
              name: territory.name || '',
              displayName: representative.name
            });
            return;
          }
        } else {
          // For all other territory types (OEM, custom types, etc.)
          setDetails({
            name: territory.name || '',
            displayName: territory.name || ''  // Use territory name as display name
          });
          return;
        }

        // Fallback for system types that are unassigned
        setDetails({
          name: territory.name || '',
          displayName: territory.type === 'branch' || territory.type === 'representative' ? 'Unassigned' : territory.name || ''
        });
      } catch (err) {
        console.error('Error in useTerritoryDetails:', err);
        setError('Failed to load details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [territory, tenant]);

  return { details, isLoading, error };
};
