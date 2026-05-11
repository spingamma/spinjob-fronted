import React from 'react';
import { Helmet } from 'react-helmet-async';

const SeoMeta = ({ 
  title, 
  description, 
  image = 'https://tarjetoso.com/icon-512.png',
  url = 'https://tarjetoso.com',
  type = 'website',
  jsonLd = null
}) => {
  const defaultTitle = "Tarjetoso | Directorio de Profesionales y Negocios en Bolivia";
  const defaultDesc = "Encuentra, contacta y califica a los mejores profesionales independientes y negocios locales de Bolivia. Tu directorio de tarjetas digitales.";
  
  const finalTitle = title ? `${title} | Tarjetoso` : defaultTitle;
  const finalDesc = description || defaultDesc;

  return (
    <Helmet>
      {/* Standard metadata tags */}
      <title>{finalTitle}</title>
      <meta name="description" content={finalDesc} />

      {/* Open Graph / Facebook / WhatsApp */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDesc} />
      <meta property="og:image" content={image} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDesc} />
      <meta name="twitter:image" content={image} />

      {/* JSON-LD Structured Data */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  );
};

export default SeoMeta;
