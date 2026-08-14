import { useMemo } from 'react';
import { normalizeText, isValidValue } from '../../utils/slugs';

export function useCategoriesData(professionals, metadataOverride, catSearch, subSearch, activeCategory) {
  const groupedCategories = useMemo(() => {
    if (metadataOverride?.groupedCategories) return metadataOverride.groupedCategories;
    const catsFromDB = [...new Set(professionals.map(p => p.category).filter(isValidValue))].sort();
    return catsFromDB.map(c => {
      const allSubs = professionals
        .filter(p => p.category === c)
        .flatMap(p => {
          try {
            const parsed = JSON.parse(p.subcategories || '[]');
            return parsed.length > 0 ? parsed : (p.subcategory ? [p.subcategory] : []);
          } catch { return p.subcategory ? [p.subcategory] : (p.subcategories ? [p.subcategories] : []); }
        })
        .filter(isValidValue);
      const subs = [...new Set(allSubs)].sort();
      return { category: c, subcategories: subs };
    });
  }, [professionals, metadataOverride]);

  const filteredGroupedCategories = useMemo(() => {
    const search = normalizeText(catSearch);
    if (!search) return groupedCategories;
    return groupedCategories.map(group => {
      const matchCategory = normalizeText(group.category).includes(search);
      const filteredSubs = group.subcategories.filter(sub => normalizeText(sub).includes(search));
      if (matchCategory || filteredSubs.length > 0) {
        return { ...group, subcategories: filteredSubs };
      }
      return null;
    }).filter(Boolean);
  }, [groupedCategories, catSearch]);

  const activeCategoryData = useMemo(() => {
    return groupedCategories.find(g => g.category === activeCategory);
  }, [groupedCategories, activeCategory]);

  const filteredSubcategories = useMemo(() => {
    const currentSubcategories = activeCategoryData ? activeCategoryData.subcategories : [];
    const search = normalizeText(subSearch);
    if (!search) return currentSubcategories;
    return currentSubcategories.filter(sub => normalizeText(sub).includes(search));
  }, [activeCategoryData, subSearch]);

  return {
    groupedCategories,
    filteredGroupedCategories,
    activeCategoryData,
    filteredSubcategories
  };
}
