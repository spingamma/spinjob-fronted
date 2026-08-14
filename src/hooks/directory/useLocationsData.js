import { useMemo } from 'react';
import { normalizeText, isValidValue } from '../../utils/slugs';

export function useLocationsData(professionals, metadataOverride, locSearch) {
  const groupedLocations = useMemo(() => {
    if (metadataOverride?.groupedLocations) return metadataOverride.groupedLocations;
    const statesFromDB = [...new Set(professionals.map(p => p.state).filter(isValidValue))].sort();
    return statesFromDB.map(s => {
      const neighs = [...new Set(professionals.filter(p => p.state === s).map(p => p.neighborhood).filter(isValidValue))].sort();
      return { state: s, neighborhoods: neighs };
    });
  }, [professionals, metadataOverride]);

  const filteredGroupedLocations = useMemo(() => {
    const search = normalizeText(locSearch);
    if (!search) return groupedLocations;
    return groupedLocations.map(group => {
      const matchState = normalizeText(group.state).includes(search);
      const filteredNeighs = (group.neighborhoods || []).filter(n => normalizeText(n).includes(search));
      if (matchState || filteredNeighs.length > 0) {
        return { ...group, neighborhoods: filteredNeighs };
      }
      return null;
    }).filter(Boolean);
  }, [groupedLocations, locSearch]);

  return {
    groupedLocations,
    filteredGroupedLocations
  };
}
