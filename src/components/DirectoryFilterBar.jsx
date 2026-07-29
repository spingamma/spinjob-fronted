import React from 'react';
import CategoryBadge from './DirectoryFilters/CategoryBadge';
import LocationFilter from './DirectoryFilters/LocationFilter';
import RatingFilter from './DirectoryFilters/RatingFilter';
import SubcategoryFilter from './DirectoryFilters/SubcategoryFilter';
import DistanceFilter from './DirectoryFilters/DistanceFilter';

export default function DirectoryFilterBar({ 
  isMobile, 
  states, 
  setters, 
  computed, 
  actions,
  userCoords
}) {
  const {
    activeCategory, activeSubcategory, activeState, activeNeighborhood, activeRating,
    activeDistance,
    openDropdown, locSearch, subSearch
  } = states;

  const isTabletOrMobile = isMobile || (typeof window !== 'undefined' && window.innerWidth < 1025 && ('ontouchstart' in window || navigator.maxTouchPoints > 0));
  const showDistanceFilter = !!userCoords && isTabletOrMobile;

  const { setLocSearch, setSubSearch } = setters;
  const { filteredSubcategories, filteredGroupedLocations } = computed;
  const { toggleDropdown, handleSelectOption } = actions;

  // Only render when a category is selected
  if (activeCategory === 'Todos') return null;

  return (
    <div className="bg-white/70 backdrop-blur-md sticky top-16 md:top-20 z-30 border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 md:py-4">
        
        {/* Row 1: Active Category Badge + Filters */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-2 md:gap-3">
          
          <CategoryBadge 
            activeCategory={activeCategory} 
            handleSelectOption={handleSelectOption} 
          />

          {/* Location Dropdown (Desktop only trigger) */}
          {!isMobile && (
            <LocationFilter 
              activeState={activeState}
              activeNeighborhood={activeNeighborhood}
              openDropdown={openDropdown}
              locSearch={locSearch}
              setLocSearch={setLocSearch}
              filteredGroupedLocations={filteredGroupedLocations}
              toggleDropdown={toggleDropdown}
              handleSelectOption={handleSelectOption}
            />
          )}

          {/* Rating Dropdown (Desktop only trigger) */}
          {!isMobile && (
            <RatingFilter 
              activeRating={activeRating}
              openDropdown={openDropdown}
              toggleDropdown={toggleDropdown}
              handleSelectOption={handleSelectOption}
            />
          )}

          {/* Subcategory Dropdown */}
          <SubcategoryFilter 
            activeSubcategory={activeSubcategory}
            openDropdown={openDropdown}
            subSearch={subSearch}
            setSubSearch={setSubSearch}
            filteredSubcategories={filteredSubcategories}
            toggleDropdown={toggleDropdown}
            handleSelectOption={handleSelectOption}
          />

          {/* Distance Dropdown (Mobiles & Tablets with GPS location only) */}
          <DistanceFilter 
            activeDistance={activeDistance}
            openDropdown={openDropdown}
            toggleDropdown={toggleDropdown}
            handleSelectOption={handleSelectOption}
            showDistanceFilter={showDistanceFilter}
          />
        </div>
      </div>
    </div>
  );
}
