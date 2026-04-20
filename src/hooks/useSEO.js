// Archivo: src/hooks/useSEO.js
import { useEffect } from 'react';

/**
 * Hook para actualizar dinámicamente los meta tags de SEO.
 * Mejora el posicionamiento en Google y la previsualización en redes sociales.
 *
 * @param {Object} config
 * @param {string} config.title - Título de la página
 * @param {string} config.description - Descripción para meta y OG
 * @param {string} [config.url] - URL canónica
 * @param {string} [config.image] - URL de imagen para OG
 * @param {string} [config.type] - Tipo OG (website, profile, article)
 * @param {Object} [config.jsonLd] - Objeto JSON-LD para structured data
 */

function setMetaTag(attr, attrValue, content) {
  if (!content) return;
  let el = document.querySelector(`meta[${attr}="${attrValue}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, attrValue);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

export default function useSEO({ title, description, url, image, type = 'website', jsonLd = null }) {
  const jsonLdString = jsonLd ? JSON.stringify(jsonLd) : null;

  useEffect(() => {
    // 1. Document title
    if (title) document.title = title;

    // 2. Meta description
    if (description) setMetaTag('name', 'description', description);

    // 3. Open Graph
    if (title) setMetaTag('property', 'og:title', title);
    if (description) setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:type', type);
    setMetaTag('property', 'og:site_name', 'Tarjetoso');
    setMetaTag('property', 'og:locale', 'es_BO');
    if (url) setMetaTag('property', 'og:url', url);
    if (image) setMetaTag('property', 'og:image', image);

    // 4. Twitter Card
    setMetaTag('name', 'twitter:card', image ? 'summary_large_image' : 'summary');
    if (title) setMetaTag('name', 'twitter:title', title);
    if (description) setMetaTag('name', 'twitter:description', description);
    if (image) setMetaTag('name', 'twitter:image', image);

    // 5. Canonical URL
    if (url) {
      let link = document.querySelector('link[rel="canonical"]');
      if (!link) {
        link = document.createElement('link');
        link.rel = 'canonical';
        document.head.appendChild(link);
      }
      link.href = url;
    }

    // 6. JSON-LD Structured Data
    const prevScript = document.getElementById('seo-json-ld');
    if (prevScript) prevScript.remove();

    let scriptEl = null;
    if (jsonLdString) {
      scriptEl = document.createElement('script');
      scriptEl.type = 'application/ld+json';
      scriptEl.id = 'seo-json-ld';
      scriptEl.textContent = jsonLdString;
      document.head.appendChild(scriptEl);
    }

    return () => {
      if (scriptEl?.parentNode) scriptEl.parentNode.removeChild(scriptEl);
    };
  }, [title, description, url, image, type, jsonLdString]);
}
