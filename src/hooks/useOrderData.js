// src/hooks/useOrderData.js

import { useState, useEffect, useRef, useCallback } from "react";
import fetchAuth from "../utils/fetchAuth";
import { API_URL } from '../config/api';

/**
 * Central hook for fetching order information and QR image.
 * Parameters are taken from the parent page.
 */
export const useOrderData = ({ slug, orderId, paymentQrImage, locationState }) => {
  const [order, setOrder] = useState(locationState?.order || null);
  const [isTrackingLoading, setIsTrackingLoading] = useState(!!orderId && !locationState?.order);
  const [isRefreshingTracking, setIsRefreshingTracking] = useState(false);
  const [fetchedQrImage, setFetchedQrImage] = useState(paymentQrImage || "");
  const [resolvedOwnerId, setResolvedOwnerId] = useState(locationState?.ownerId || null);

  const fetchedQrImageRef = useRef(paymentQrImage || "");

  const loadOrder = useCallback(async (isSilent = false) => {
    if (!orderId) return;
    if (!isSilent) setIsTrackingLoading(true);
    else setIsRefreshingTracking(true);

    let resolvedOrder = null;
    let resolvedQr = locationState?.paymentQrImage || paymentQrImage || fetchedQrImageRef.current;
    const isUuidSlug = slug && slug.length > 20 && slug.includes("-");
    const activeSlug = isUuidSlug ? "spingamma" : slug || "spingamma";

    try {
      if (!resolvedQr) {
        const bizRes = await fetchAuth(`${API_URL}/businesses/${activeSlug}`).catch(() => null);
        if (bizRes && bizRes.ok) {
          const bizData = await bizRes.json().catch(() => ({}));
          if (bizData.owner_id) setResolvedOwnerId(bizData.owner_id);
          resolvedQr = bizData.payment_qr_image || bizData.qr_payment_url || resolvedQr;
          setFetchedQrImage(resolvedQr);
          fetchedQrImageRef.current = resolvedQr;
        }
      }

      let res = await fetchAuth(`${API_URL}/businesses/${activeSlug}/orders/${orderId}`).catch(() => null);
      if (res && res.ok) {
        resolvedOrder = await res.json().catch(() => null);
      } else {
        const myOrdersRes = await fetchAuth(`${API_URL}/usuarios/mis-pedidos`).catch(() => null);
        if (myOrdersRes && myOrdersRes.ok) {
          const myOrders = await myOrdersRes.json().catch(() => []);
          resolvedOrder = Array.isArray(myOrders)
            ? myOrders.find((o) => String(o.id) === String(orderId) || String(o.order_number) === String(orderId))
            : null;
        }
      }

      if (resolvedOrder) {
        setOrder(resolvedOrder);
      }
    } catch (e) {
      console.error("Error al cargar orden:", e);
    } finally {
      setIsTrackingLoading(false);
      setIsRefreshingTracking(false);
    }
  }, [orderId, slug, locationState, paymentQrImage]);

  // Carga inicial de datos
  useEffect(() => {
    if (orderId) {
      loadOrder(false);
    } else if (slug) {
      // Helper to fetch QR when missing
      const fetchQrIfMissing = async () => {
        if (fetchedQrImageRef.current) return;
        const trySlugs = [slug, slug === "tarjetoso" ? "spingamma" : "tarjetoso", "spingamma"];
        for (const s of trySlugs) {
          try {
            const res = await fetchAuth(`${API_URL}/businesses/${s}`);
            if (res && res.ok) {
              const data = await res.json();
              if (data.owner_id) setResolvedOwnerId(data.owner_id);
              const qr =
                data.payment_qr_image ||
                data.qr_payment_url ||
                data.payment_qr ||
                data.qr_image ||
                data.qr_image_url ||
                data.qr_code ||
                data.qr ||
                "";
              if (qr) {
                setFetchedQrImage(qr);
                fetchedQrImageRef.current = qr;
                break;
              }
            }
          } catch { /* ignore */ }
        }
      };
      fetchQrIfMissing();
    }
  }, [slug, orderId, loadOrder]);

  // Sondeo pasivo y escalable de posición GPS exclusivamente cuando order.status === 'en_camino'
  // Pausado automáticamente si la pestaña no está visible (Page Visibility API)
  useEffect(() => {
    if (!orderId || order?.status !== 'en_camino') return;

    const pollLocation = () => {
      if (typeof document !== 'undefined' && document.hidden) return;
      loadOrder(true);
    };

    const interval = setInterval(pollLocation, 35000); // Cada 35 segundos

    const handleVisibility = () => {
      if (typeof document !== 'undefined' && !document.hidden) {
        pollLocation();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [orderId, order?.status, loadOrder]);

  return {
    order,
    isTrackingLoading,
    isRefreshingTracking,
    fetchedQrImage,
    resolvedOwnerId,
    setResolvedOwnerId,
    refetchOrder: () => loadOrder(true)
  };
};
