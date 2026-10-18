// src/components/OrderSummary/hooks/useDeliveryCalculation.js

import { useState, useEffect, useMemo, useCallback } from 'react';
import { parseGoogleMapsCoords } from '../../../plantillas/utils/parseGoogleMapsCoords';
import { 
  calculateDistanceKm, 
  calculateRoadDistanceKm, 
  calculateDeliveryFee, 
  formatGoogleMapsUrl, 
  DELIVERY_RATE_PER_KM,
  URBAN_CIRCUITY_FACTOR 
} from '../../../utils/deliveryCalculator';
import fetchAuth from '../../../utils/fetchAuth';
import { API_URL } from '../../../config/api';
import { DELIVERY_METHOD_COURIER } from '../../../utils/deliveryConstants';

/**
 * Hook modular para aislar toda la lógica de cotización de delivery,
 * obtención de coordenadas del negocio, confirmación de ubicación del cliente
 * y cálculo de tarifa por kilómetro en ruta vial real.
 */
export function useDeliveryCalculation({
  slug,
  businessLocationUrl: initialBusinessLocationUrl,
  selectedDeliveryMethod
}) {
  const [fetchedBusinessLocationUrl, setFetchedBusinessLocationUrl] = useState('');
  const [isResolvingBusiness, setIsResolvingBusiness] = useState(false);
  const [customerCoords, setCustomerCoords] = useState(null);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [resolvedBusinessCoords, setResolvedBusinessCoords] = useState(null);
  const [distanceKm, setDistanceKm] = useState(0);
  const [isCalculatingDistance, setIsCalculatingDistance] = useState(false);

  const businessLocationUrl = initialBusinessLocationUrl || fetchedBusinessLocationUrl;
  const isCourierSelected = selectedDeliveryMethod === DELIVERY_METHOD_COURIER;

  // Si no tenemos la URL del negocio y el usuario selecciona Delivery, la consultamos de la API
  useEffect(() => {
    if (isCourierSelected && !businessLocationUrl && slug) {
      let isMounted = true;
      Promise.resolve().then(() => {
        if (isMounted) setIsResolvingBusiness(true);
      });

      fetchAuth(`${API_URL}/businesses/${slug}`)
        .then(res => (res && res.ok ? res.json() : null))
        .then(data => {
          if (isMounted && data) {
            const locUrl = data.ubicacion_url || data.ubicacion || '';
            if (locUrl) {
              setFetchedBusinessLocationUrl(locUrl);
            }
          }
        })
        .catch(err => {
          console.error('Error fetching business location for delivery:', err);
        })
        .finally(() => {
          if (isMounted) setIsResolvingBusiness(false);
        });

      return () => {
        isMounted = false;
      };
    }
  }, [isCourierSelected, businessLocationUrl, slug]);

  // Coordenadas parseadas o resueltas del negocio
  useEffect(() => {
    if (!businessLocationUrl) {
      setResolvedBusinessCoords(null);
      return;
    }

    const direct = parseGoogleMapsCoords(businessLocationUrl);
    if (direct) {
      setResolvedBusinessCoords(direct);
    } else if (businessLocationUrl.includes('maps.app.goo.gl') || businessLocationUrl.includes('goo.gl/maps')) {
      let isMounted = true;
      setIsResolvingBusiness(true);
      fetch(`${API_URL}/businesses/resolve-url?url=${encodeURIComponent(businessLocationUrl)}`)
        .then(res => (res.ok ? res.json() : null))
        .then(data => {
          if (isMounted && data) {
            const resolvedStr = data.resolved_url || data.url;
            const parsed = parseGoogleMapsCoords(resolvedStr);
            if (parsed) {
              setResolvedBusinessCoords(parsed);
            }
          }
        })
        .catch(err => {
          console.warn('Error resolving business short url:', err);
        })
        .finally(() => {
          if (isMounted) setIsResolvingBusiness(false);
        });

      return () => {
        isMounted = false;
      };
    } else {
      setResolvedBusinessCoords(null);
    }
  }, [businessLocationUrl]);

  const businessCoords = resolvedBusinessCoords;
  const businessHasLocation = !!businessCoords;

  // Cálculo de distancia vial real (asíncrono con feedback inmediato)
  useEffect(() => {
    if (!isCourierSelected || !businessCoords || !customerCoords) {
      setDistanceKm(0);
      setIsCalculatingDistance(false);
      return;
    }

    let isMounted = true;
    setIsCalculatingDistance(true);

    // 1. Estimación inmediata basada en factor de sinuosidad urbana vial (1.8x)
    const initialEstimate = calculateDistanceKm(
      businessCoords.lat,
      businessCoords.lng,
      customerCoords.lat,
      customerCoords.lng
    );
    setDistanceKm(initialEstimate);

    // 2. Consulta de ruteo vehicular real en calles (OSRM)
    calculateRoadDistanceKm(
      businessCoords.lat,
      businessCoords.lng,
      customerCoords.lat,
      customerCoords.lng
    )
      .then(roadKm => {
        if (isMounted && roadKm > 0) {
          setDistanceKm(roadKm);
        }
      })
      .catch(err => {
        console.warn('Error fetching road distance, keeping estimate:', err);
      })
      .finally(() => {
        if (isMounted) setIsCalculatingDistance(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isCourierSelected, businessCoords, customerCoords]);

  const deliveryFee = useMemo(() => {
    if (!isCourierSelected) return 0;
    return calculateDeliveryFee(distanceKm, DELIVERY_RATE_PER_KM);
  }, [isCourierSelected, distanceKm]);

  const customerLocationUrl = useMemo(() => {
    if (!customerCoords) return '';
    return formatGoogleMapsUrl(customerCoords.lat, customerCoords.lng);
  }, [customerCoords]);

  // El delivery está listo sólo si el negocio tiene ubicación y el cliente la confirmó
  const isDeliveryReady = useMemo(() => {
    if (!isCourierSelected) return true;
    return businessHasLocation && customerCoords !== null;
  }, [isCourierSelected, businessHasLocation, customerCoords]);

  const openMap = useCallback(() => {
    setIsMapOpen(true);
  }, []);

  const closeMap = useCallback(() => {
    setIsMapOpen(false);
  }, []);

  const confirmCustomerLocation = useCallback((coords) => {
    if (coords && coords.lat != null && coords.lng != null) {
      setCustomerCoords({
        lat: parseFloat(coords.lat),
        lng: parseFloat(coords.lng)
      });
      setIsMapOpen(false);
    }
  }, []);

  const resetCustomerLocation = useCallback(() => {
    setCustomerCoords(null);
  }, []);

  return {
    isCourierSelected,
    businessCoords,
    businessHasLocation,
    isResolvingBusiness,
    customerCoords,
    isLocationConfirmed: customerCoords !== null,
    isMapOpen,
    distanceKm,
    isCalculatingDistance,
    deliveryFee,
    deliveryRatePerKm: DELIVERY_RATE_PER_KM,
    customerLocationUrl,
    isDeliveryReady,
    openMap,
    closeMap,
    confirmCustomerLocation,
    resetCustomerLocation
  };
}
