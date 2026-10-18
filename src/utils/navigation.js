// src/utils/navigation.js

/**
 * Centralised navigation helper functions for the app.
 * Keeping logic here avoids duplication across pages and makes unit testing easier.
 */
export const goBack = (navigate) => {
  navigate(-1);
};

