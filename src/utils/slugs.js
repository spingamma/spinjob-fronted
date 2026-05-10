// Archivo: src/utils/slugs.js

export const slugify = (text) => {
  if (!text) return '';
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
};

export const matchSlugToName = (slug, options, defaultValue) => {
  if (!slug || slug === 'todos' || slug === 'todas') return defaultValue;
  const match = options.find(opt => slugify(opt) === slug);
  return match || defaultValue;
};
