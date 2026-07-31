// src/pages/OrderSummary/OrderSummary.jsx

import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import fetchAuth from '../../utils/fetchAuth';
import { API_URL } from '../../config/api';
import { Loader2 } from 'lucide-react';

import CheckoutSection from '../../components/OrderSummary/CheckoutSection';
import TrackingSection from '../../components/OrderSummary/TrackingSection';
import Header from '../../components/OrderSummary/Header';

import { useOrderData } from '../../hooks/useOrderData';
import { useReceiptUploader } from '../../hooks/useReceiptUploader';

export default function OrderSummary() {
  const { slug, orderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { cart, deliveryMethods, paymentQrImage, ownerId } = location.state || {};

  const userStr = localStorage.getItem('spingamma_user');
  const user = userStr ? JSON.parse(userStr) : null;
  const token = localStorage.getItem('spingamma_token');

  const isOwner = user && ownerId && String(user.id) === String(ownerId);

  // Use custom hook for order data & QR handling
  const {
    order,
    isTrackingLoading,
    fetchedQrImage,
  } = useOrderData({ slug, orderId, paymentQrImage, locationState: location.state });

  // Receipt uploader hook (used only in tracking view)
  const {
    receiptPreview,
    setReceiptPreview,
    receiptError,
    isUploading,
    handleFileChange,
    handleUploadReceipt,
  } = useReceiptUploader({ slug, orderId: order?.id, navigate });

  // Guard: not logged in
  if (!token) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-xl font-bold text-[#1A535C] mb-4">Debes iniciar sesión</h2>
        <p className="mb-6 text-[#757778]">Para continuar necesitas estar registrado e iniciar sesión.</p>
        <button onClick={() => navigate('/')} className="px-6 py-3 bg-[#F9842C] text-white rounded-xl font-bold" data-testid="login-home-btn">
          Ir al Inicio para ingresar
        </button>
      </div>
    );
  }

  // Loading tracking data
  if (isTrackingLoading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center p-6 text-center">
        <Loader2 size={36} className="animate-spin text-[#F9842C] mb-3" />
        <p className="text-sm font-bold text-[#1A535C]">Cargando información de tu pedido...</p>
      </div>
    );
  }

  // Determine which view to render
  const showCheckout = !orderId && !order;

  if (showCheckout) {
    // Validate cart presence
    if (!cart || Object.keys(cart).length === 0) {
      return (
        <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center p-6 text-center">
          <h2 className="text-xl font-bold text-[#1A535C] mb-4">No hay productos en tu orden</h2>
          <button onClick={() => navigate(`/perfil/${slug}`)} className="px-6 py-3 bg-[#F9842C] text-white rounded-xl font-bold" data-testid="back-to-profile-btn">
            Volver al perfil
          </button>
        </div>
      );
    }
    // Render checkout UI
    return (
      <CheckoutSection
        isOwner={isOwner}
        // For brevity, passing minimal required props. The component contains its own state handling.
        slug={slug}
        navigate={navigate}
        cart={cart}
        deliveryMethods={deliveryMethods}
        fetchedQrImage={fetchedQrImage}
      />
    );
  }

  // Tracking view
  const displayQr = order?.qr_image_url || order?.payment_qr_image || fetchedQrImage;
  const isPending = !order?.status || order?.status === 'pendiente' || order?.status === 'pendiente_de_pago';

  const handleDownloadQr = async () => {
    if (!displayQr) return;
    try {
      const response = await fetch(displayQr);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `QR-Pago-${slug || 'negocio'}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error al descargar QR:', err);
    }
  };

  const handleConfirmReceived = async () => {
    try {
      const res = await fetchAuth(`${API_URL}/usuarios/pedidos/${order?.id}/recibido`, { method: 'PUT' });
      if (!res.ok) throw new Error('Error al confirmar');
      // Update status locally (optimistic)
      order.status = 'completado';
      alert('¡Gracias! Has confirmado la recepción del producto.');
    } catch {
      alert('Hubo un error al confirmar. Intenta nuevamente.');
    }
  };

  const handleReportIssue = () => {
    const text = encodeURIComponent(`Hola Tarjetoso, necesito ayuda con mi pedido #${order?.order_number || order?.id}. El estado marca que el negocio ya lo despachó/entregado pero tengo un problema.`);
    window.open(`https://wa.me/59174116223?text=${text}`, '_blank');
  };

  return (
    <TrackingSection
      navigate={navigate}
      slug={slug}
      order={order}
      displayQr={displayQr}
      isPending={isPending}
      handleDownloadQr={handleDownloadQr}
      receiptPreview={receiptPreview}
      setReceiptPreview={setReceiptPreview}
      receiptError={receiptError}
      isUploading={isUploading}
      handleFileChange={handleFileChange}
      handleUploadReceipt={handleUploadReceipt}
      handleConfirmReceived={handleConfirmReceived}
      handleReportIssue={handleReportIssue}
    />
  );
}
