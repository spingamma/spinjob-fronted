import React from 'react';
import MapSelectorModal from '../../components/MapSelectorModal';
import useProfileLocation from '../hooks/useProfileLocation';

import HeroTopNav from './hero/HeroTopNav';
import HeroBanner from './hero/HeroBanner';
import HeroInfoEdit from './hero/HeroInfoEdit';
import HeroInfoView from './hero/HeroInfoView';

export default function ProfileHero({
  profesional,
  volverAtras,
  isLoggedIn,
  userName,
  handleLogout,
  onProtectedAction,
  handleShare,
  toggleQR,
  isOwner,
  isEditing,
  setIsEditing,
  toggleSaveCard,
  isSaving,
  isSaved,
  editFormData,
  handleEditChange,
  handleLinkClick,
  links,
  imagePreview,
  setEditFormData,
  isCreateMode,
  specialtiesData
}) {
  const {
    isMapOpen,
    setIsMapOpen,
    detectedCoords,
    resolvingUrl,
    countriesList,
    handleMapConfirm
  } = useProfileLocation(editFormData, setEditFormData);

  return (
    <>
      <HeroTopNav 
        volverAtras={volverAtras}
        isLoggedIn={isLoggedIn}
        userName={userName}
        handleLogout={handleLogout}
        onProtectedAction={onProtectedAction}
      />

      <div className="relative overflow-hidden mb-6 pt-16 bg-[#F8F9FA] sm:bg-transparent">
        <div className="relative z-10 flex flex-col">
          
          <HeroBanner 
            profesional={profesional}
            imagePreview={imagePreview}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            handleEditChange={handleEditChange}
            isOwner={isOwner}
            handleShare={handleShare}
            toggleQR={toggleQR}
            isCreateMode={isCreateMode}
            links={links}
            handleLinkClick={handleLinkClick}
            toggleSaveCard={toggleSaveCard}
            isSaving={isSaving}
            isSaved={isSaved}
          />

          <div className="flex justify-between items-start px-6 sm:px-8 md:px-6 lg:px-8 max-w-4xl mx-auto w-full gap-4">
            <div className="text-left flex-1">
              {isEditing ? (
                <HeroInfoEdit 
                  editFormData={editFormData}
                  setEditFormData={setEditFormData}
                  handleEditChange={handleEditChange}
                  isCreateMode={isCreateMode}
                  specialtiesData={specialtiesData}
                  countriesList={countriesList}
                  setIsMapOpen={setIsMapOpen}
                  resolvingUrl={resolvingUrl}
                  detectedCoords={detectedCoords}
                />
              ) : (
                <HeroInfoView 
                  profesional={profesional}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <MapSelectorModal
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        onConfirm={handleMapConfirm}
        initialCoords={detectedCoords}
        selectedState={editFormData?.state}
      />
    </>
  );
}
