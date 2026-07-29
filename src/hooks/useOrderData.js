// src/hooks/useOrderData.js

import { useState, useEffect, useRef } from "react";
import fetchAuth from "../utils/fetchAuth"; // adjust relative path based on where this file lives
import { API_URL } from '../config/api';

/**
 * Central hook for fetching order information and QR image.
 * Parameters are taken from the parent page.
 */
export const useOrderData = ({ slug, orderId, paymentQrImage, locationState }) => {
  const [order, setOrder] = useState(null);
  const [isTrackingLoading, setIsTrackingLoading] = useState(!!orderId);
  const [fetchedQrImage, setFetchedQrImage] = useState(paymentQrImage || "");
  const [resolvedOwnerId, setResolvedOwnerId] = useState(locationState?.ownerId || null);

  const fetchedQrImageRef = useRef(paymentQrImage || "");


  useEffect(() => {
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

    if (orderId) {
      const loadOrder = async () => {
        setIsTrackingLoading(true);
        let resolvedOrder = locationState?.order || null;
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
          if (!resolvedOrder) {
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
          }
          if (resolvedOrder) setOrder(resolvedOrder);
        } catch (e) {
          console.error(e);
        } finally {
          setIsTrackingLoading(false);
        }
      };
      loadOrder();
    } else if (slug) {
      fetchQrIfMissing();
    }
  }, [slug, orderId, locationState, paymentQrImage, API_URL]);

  return {
    order,
    isTrackingLoading,
    fetchedQrImage,
    resolvedOwnerId,
    setResolvedOwnerId,
  };
};
