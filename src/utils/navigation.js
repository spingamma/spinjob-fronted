// src/utils/navigation.js

/**
 * Centralised navigation helper functions for the app.
 * Keeping logic here avoids duplication across pages and makes unit testing easier.
 */
export const goBack = (navigate) => {
  navigate(-1);
};

export const goToProfile = (slug, navigate) => {
  navigate(`/perfil/${slug}`);
};

export const goToHome = (navigate) => {
  navigate(`/`);
};

export const replaceWithOrder = (slug, orderId, state, navigate) => {
  // Replace the current entry so the back button does not go to the empty checkout view.
  navigate(`/perfil/${slug}/orden/${orderId}`, { state, replace: true });
};
