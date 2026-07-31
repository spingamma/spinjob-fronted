// Archivo: src/utils/imageUtils.js

/**
 * Comprime una imagen en el lado del cliente usando un Canvas HTML5.
 * @param {File} file - Archivo de imagen original.
 * @param {number} maxWidth - Ancho máximo deseado.
 * @param {number} quality - Calidad JPEG (0 a 1).
 * @returns {Promise<File>} Archivo comprimido (o el original si no se puede).
 */
export const compressImage = (file, maxWidth = 1024, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      resolve(file);
      return;
    }

    // Si ya es bastante ligero (< 300KB), no forzar compresión excesiva
    if (file.size < 300 * 1024) {
      resolve(file);
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }
            const extension = file.name.split('.').pop();
            const newName = file.name.replace(`.${extension}`, '.jpg');
            const compressedFile = new File([blob], newName, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = (error) => resolve(file); // Si hay error, devolver original
    };
    reader.onerror = (error) => resolve(file);
  });
};
