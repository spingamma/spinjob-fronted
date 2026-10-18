// src/components/OrderSummary/hooks/useDeliveryCalculation.js

import { useState, useEffect, useMemo, useCallback } from 'react';
import { parseGoogleMapsCoords } from '../../../plantillas/utils/parseGoogleMapsCoords';
import { calculateDistanceKm, calculateDeliveryFee, formatGoogleMapsUrl, DELIVERY_RATE_PER_KM } from '../../../utils/deliveryCalculator';
import fetchAuth from '../../../utils/fetchAuth';
import { API_URL } from '../../../config/api';
import { DELIVERY_METHOD_COURIER } from '../../../utils/deliveryConstants';

/**
 * Hook modular para aislar toda la lógica de cotización de delivery,
 * obtención de coordenadas del negocio, confirmación de ubicación del cliente
 * y cálculo de tarifa por kilómetro.
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

  // Coordenadas parseadas del negocio
  const businessCoords = useMemo(() => {
    return parseGoogleMapsCoords(businessLocationUrl);
  }, [businessLocationUrl]);

  const businessHasLocation = !!businessCoords;

  // Cálculo de distancia y costo
  const distanceKm = useMemo(() => {
    if (!isCourierSelected || !businessCoords || !customerCoords) return 0;
    return calculateDistanceKm(
      businessCoords.lat,
      businessCoords.lng,
      customerCoords.lat,
      customerCoords.lng
    );
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
