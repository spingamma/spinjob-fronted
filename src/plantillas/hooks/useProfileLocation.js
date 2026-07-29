import { useState, useEffect } from 'react';
import { parseGoogleMapsCoords } from '../utils/parseGoogleMapsCoords';
import { API_URL } from '../../config/api';

export default function useProfileLocation(editFormData, setEditFormData) {
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [detectedCoords, setDetectedCoords] = useState(null);
  const [resolvingUrl, setResolvingUrl] = useState(false);
  const [countriesList, setCountriesList] = useState([]);

  useEffect(() => {
    async function loadCountries() {
      try {
        const res = await fetch(`${API_URL}/countries/`);
        if (res.ok) {
          const data = await res.json();
          setCountriesList(data);
        }
      } catch (err) {
        console.error("Error loading countries list:", err);
      }
    }
    loadCountries();
  }, []);

  useEffect(() => {
    const url = editFormData?.ubicacion_url;
    if (!url) {
      setDetectedCoords(null);
      return;
    }

    const parsed = parseGoogleMapsCoords(url);
    if (parsed) {
      setDetectedCoords(parsed);
    } else if (url.includes('maps.app.goo.gl') || url.includes('goo.gl/maps')) {
      const resolveShortUrl = async () => {
        setResolvingUrl(true);
        try {
          const res = await fetch(`${API_URL}/businesses/resolve-url?url=${encodeURIComponent(url)}`);
          if (res.ok) {
            const data = await res.json();
            if (data.resolved_url) {
              const parsedResolved = parseGoogleMapsCoords(data.resolved_url);
              if (parsedResolved) {
                setDetectedCoords(parsedResolved);
                setEditFormData(prev => ({
                  ...prev,
                  ubicacion_url: `https://www.google.com/maps?q=${parsedResolved.lat},${parsedResolved.lng}`
                }));
              }
            }
          }
        } catch (err) {
          console.error("Error resolving short URL:", err);
        } finally {
          setResolvingUrl(false);
        }
      };

      const timer = setTimeout(() => {
        resolveShortUrl();
      }, 800);
      return () => clearTimeout(timer);
    } else {
      setDetectedCoords(null);
    }
  }, [editFormData?.ubicacion_url, setEditFormData]);

  const handleMapConfirm = (coords) => {
    const googleMapsUrl = `https://www.google.com/maps?q=${coords.lat},${coords.lng}`;
    setEditFormData({
      ...editFormData,
      ubicacion_url: googleMapsUrl
    });
    setDetectedCoords(coords);
    setIsMapOpen(false);
  };

  return {
    isMapOpen,
    setIsMapOpen,
    detectedCoords,
    resolvingUrl,
    countriesList,
    handleMapConfirm
  };
}
