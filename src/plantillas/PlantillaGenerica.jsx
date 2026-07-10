// Archivo: src/plantillas/PlantillaGenerica.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Loader2, Save } from 'lucide-react';

import useAccionesPerfil from '../hooks/useAccionesPerfil';
import ReviewModal from '../components/ReviewModal';
import ModalVerificacion from '../components/ModalVerificacion';
import InlineCatalogCarousel from '../components/InlineCatalogCarousel';
import fetchAuth from '../utils/fetchAuth';

import ProfileHero from './components/ProfileHero';
import ProfileAbout from './components/ProfileAbout';
import ProfileContact from './components/ProfileContact';
import ProfileQRModal from './components/ProfileQRModal';
import ProfileCatalogEdit from './components/ProfileCatalogEdit';

// UTIL: Decodificar JWT para obtener el user ID
function getUserIdFromToken() {
  const token = localStorage.getItem('spingamma_token');
  if (!token) return null;
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const pad = base64.length % 4;
    const padded = pad ? base64 + '='.repeat(4 - pad) : base64;
    const payload = JSON.parse(window.atob(padded));
    return payload.sub;
  } catch (e) {
    console.error("Token decode error:", e);
    return null;
  }
}

export default function PlantillaGenerica({ profesional, volverAtras, onProtectedAction, onUpdate, isCreateMode = false }) {
  const navigate = useNavigate();
  // 🚀 EXTRAÍDO AL HOOK: Lógica centralizada
  const {
    mostrarQR, toggleQR, handleDownloadQR, mostrarCalificacion, isLoggedIn, userName, handleLogout,
    handleShare, handleLinkClick, handleCalificarClick, handleCerrarPanelCalificacion,
    mostrarModalCalificando, setMostrarModalCalificando, calificacionPrevia, isSubmittingReview, handleSubmitReview,
    mostrarModalVerificacion, setMostrarModalVerificacion,
    isSaved, isSaving, toggleSaveCard
  } = useAccionesPerfil(profesional, onProtectedAction);

  // ==========================================
  // 📝 MODO EDICIÓN "INLINE"
  // ==========================================
  const userId = getUserIdFromToken();
  const userObj = JSON.parse(localStorage.getItem('spingamma_user') || '{}');
  const isAdmin = userObj.is_admin === true;
  const isOwner = isLoggedIn && (isAdmin || profesional?.owner_id === userId);

  const [isEditing, setIsEditing] = useState(isCreateMode);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editFormData, setEditFormData] = useState(() => {
    if (!profesional) return {};
    let initialWaNumbers = [];
    try { initialWaNumbers = JSON.parse(profesional.whatsapp_numbers || '[]'); } catch { initialWaNumbers = []; }
    if (initialWaNumbers.length === 0 && profesional.whatsapp) initialWaNumbers = [profesional.whatsapp];

    return {
      name: profesional.name || '',
      title: profesional.title || '',
      description: profesional.description || '',
      experience_years: profesional.experience_years || '',
      credentials: profesional.credentials || '',
      phone: profesional.phone || '',
      whatsapp_numbers: initialWaNumbers,
      facebook: profesional.facebook || '',
      instagram: profesional.instagram || '',
      linkedin: profesional.linkedin || '',
      tiktok: profesional.tiktok || '',
      github: profesional.github || '',
      website: profesional.website || '',
      country: profesional.country || 'Bolivia',
      state: profesional.state || '',
      home_delivery: profesional.home_delivery || false,
      national_delivery: profesional.national_delivery || false,
      ubicacion_url: profesional.ubicacion_url || '',
      category: profesional.category || '',
      subcategories: (() => {
        try {
          return typeof profesional.subcategories === 'string' ? JSON.parse(profesional.subcategories) : (profesional.subcategories || []);
        } catch(e) {
          return (profesional.subcategories && profesional.subcategories.length > 0) ? profesional.subcategories.split(',') : [];
        }
      })(),
      seller_code: '',
      orders_enabled: profesional.orders_enabled !== false,
      carousel_order: profesional.carousel_order || ''
    };
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [specialtiesData, setSpecialtiesData] = useState([]);
  const [localProducts, setLocalProducts] = useState([]);
  const [deletedProductsIds, setDeletedProductsIds] = useState([]);
  const [hasUnsavedProduct, setHasUnsavedProduct] = useState(false);

  // Fetch specialties & products
  useEffect(() => {
    if (isEditing) {
      const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
      fetch(`${API_URL}/specialties/grouped`)
        .then(res => res.ok ? res.json() : [])
        .then(data => setSpecialtiesData(data))
        .catch(err => console.error("Error fetching specialties:", err));

      if (!isCreateMode && profesional?.slug) {
        fetch(`${API_URL}/businesses/${profesional.slug}/products`)
          .then(res => res.ok ? res.json() : [])
          .then(data => setLocalProducts(data))
          .catch(err => console.error("Error fetching products:", err));
      }
    }
  }, [isEditing, isCreateMode, profesional?.slug]);

  useEffect(() => {
    if (profesional && !isEditing) {
      // Al salir de edición, reseteamos el form local
      let initialWaNumbers = [];
      try { initialWaNumbers = JSON.parse(profesional.whatsapp_numbers || '[]'); } catch { initialWaNumbers = []; }
      if (initialWaNumbers.length === 0 && profesional.whatsapp) initialWaNumbers = [profesional.whatsapp];

      setEditFormData({
        name: profesional.name || '',
        title: profesional.title || '',
        description: profesional.description || '',
        experience_years: profesional.experience_years || '',
        credentials: profesional.credentials || '',
        phone: profesional.phone || '',
        whatsapp_numbers: initialWaNumbers,
        facebook: profesional.facebook || '',
        instagram: profesional.instagram || '',
        linkedin: profesional.linkedin || '',
        tiktok: profesional.tiktok || '',
        github: profesional.github || '',
        website: profesional.website || '',
        country: profesional.country || 'Bolivia',
        state: profesional.state || '',
        home_delivery: profesional.home_delivery || false,
        national_delivery: profesional.national_delivery || false,
        ubicacion_url: profesional.ubicacion_url || '',
        category: profesional.category || '',
        subcategories: (() => {
          try {
            return typeof profesional.subcategories === 'string' ? JSON.parse(profesional.subcategories) : (profesional.subcategories || []);
          } catch(e) {
            return (profesional.subcategories && profesional.subcategories.length > 0) ? profesional.subcategories.split(',') : [];
          }
        })(),
        seller_code: '',
        orders_enabled: profesional.orders_enabled !== false,
        carousel_order: profesional.carousel_order || ''
      });
    }
  }, [profesional, isEditing]);

  const handleEditChange = (e) => {
    if (e.target.name === 'image') {
      const file = e.target.files[0];
      if (file) {
        setEditFormData({ ...editFormData, new_image: file });
        setImagePreview(URL.createObjectURL(file));
      }
    } else {
      setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
    }
  };

  const handleSaveEdit = async () => {
    if (hasUnsavedProduct) {
      alert("Tienes un producto a medio editar en el catálogo. Por favor completa su nombre y haz clic en 'Añadir' / 'Actualizar', o cancela la edición antes de guardar la tarjeta.");
      return;
    }

    if (!editFormData.name?.trim() || !editFormData.title?.trim() || !editFormData.description?.trim() || !editFormData.category?.trim() || !editFormData.state?.trim() || !editFormData.subcategories || editFormData.subcategories.length === 0) {
      alert("Faltan campos obligatorios. Por favor completa: Nombre, Título, Descripción, Categoría, Subcategoría y Departamento/Estado.");
      return;
    }

    if (editFormData.name.trim().length > 30) {
      alert("El nombre del negocio no puede tener más de 30 caracteres.");
      return;
    }

    if (editFormData.ubicacion_url && editFormData.ubicacion_url.trim() !== '') {
      const parseGoogleMapsCoords = (url) => {
        if (!url) return null;
        // 1. Pin data: !3dLat!4dLng
        let match = url.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
        if (match) {
          return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
        }
        // 2. Query parameter: q=lat,lng
        match = url.match(/[?&](q|query)=(-?\d+\.\d+),(-?\d+\.\d+)/);
        if (match) {
          return { lat: parseFloat(match[2]), lng: parseFloat(match[3]) };
        }
        // 3. Path place: /place/lat,lng
        match = url.match(/\/place\/(-?\d+\.\d+),(-?\d+\.\d+)/);
        if (match) {
          return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
        }
        // 4. Viewport/Camera fallback: @lat,lng
        match = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
        if (match) {
          return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
        }
        // 5. Direct coordinates: "lat,lng"
        match = url.match(/^\s*(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)\s*$/);
        if (match) {
          return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
        }
        return null;
      };
      
      const parsed = parseGoogleMapsCoords(editFormData.ubicacion_url);
      if (!parsed) {
        alert("No se han detectado coordenadas válidas en la ubicación. Por favor, pega un enlace válido o utiliza el botón 'Elegir en el Mapa'.");
        return;
      }
    }


    if (isCreateMode) {
      const isVerifiedStrict = userObj?.is_verified === true || userObj?.is_verified === "true" || userObj?.is_verified === 1;
      if (!isVerifiedStrict) {
        setMostrarModalVerificacion(true);
        return;
      }
    }

    setIsSavingEdit(true);
    const token = localStorage.getItem('spingamma_token');
    try {
      const payload = { ...editFormData };
      
      const formDataObj = new FormData();
      Object.keys(payload).forEach(key => {
        if (key === 'new_image') {
          if (payload[key]) formDataObj.append('image', payload[key]);
        } else if (key === 'carousel_order') {
          formDataObj.append('carousel_order', payload[key] || '');
        } else if (key === 'whatsapp_numbers') {
          const validNumbers = payload.whatsapp_numbers.filter(n => n.trim() !== '');
          formDataObj.append('whatsapp_numbers', JSON.stringify(validNumbers));
          if (validNumbers.length > 0) {
             formDataObj.append('whatsapp', validNumbers[0]); // fallback legacy
          } else {
             formDataObj.append('whatsapp', '');
          }
        } else if (key === 'subcategories') {
          if (payload[key].length > 0) {
             formDataObj.append('subcategories', JSON.stringify(payload[key]));
          }
        } else if (payload[key] !== null && payload[key] !== '') {
          formDataObj.append(key, payload[key]);
        }
      });

      const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
      
      let res;
      if (isCreateMode) {
        res = await fetchAuth(`${API_URL}/businesses/`, {
          method: 'POST',
          body: formDataObj
        });
      } else {
        res = await fetchAuth(`${API_URL}/businesses/${profesional.slug}/editar`, {
          method: 'PUT',
          body: formDataObj
        });
      }

      if (!res.ok) {
        const errData = await res.json();
        let errorMessage = "Error al guardar cambios";
        if (errData.detail) {
          if (Array.isArray(errData.detail)) {
             errorMessage = errData.detail.map(e => `${e.loc ? e.loc[e.loc.length-1] : 'Campo'}: ${e.msg}`).join('\n');
          } else {
             errorMessage = errData.detail;
          }
        }
        throw new Error(errorMessage);
      }
      
      const responseData = await res.json();
      const currentSlug = isCreateMode ? responseData.slug : profesional.slug;

      // 🛒 PROCESAR PRODUCTOS DEL CATÁLOGO
      // 1. Eliminar productos
      for (const prodId of deletedProductsIds) {
        try {
          const delRes = await fetchAuth(`${API_URL}/businesses/${currentSlug}/products/${prodId}`, {
            method: 'DELETE'
          });
          if (!delRes.ok) {
            const errData = await delRes.json().catch(() => ({}));
            throw new Error(errData.detail || `Error al eliminar producto`);
          }
        } catch (e) {
          if (e.message !== 'SESSION_EXPIRED') {
            console.error("Error eliminando producto:", e);
            throw e;
          }
        }
      }

      // 2. Guardar/Actualizar productos
      for (const prod of localProducts) {
        // Solo guardamos si es nuevo o modificado (no tiene id, o tiene 'imageFile', o isModified)
        // Para simplificar, si el producto tiene id pero no tiene imageFile ni cambios, podríamos omitirlo.
        // Pero enviaremos todos los que tengan `file` o no tengan `id`, o tengan `isModified`
        if (!prod.id || prod.isModified) {
          const pForm = new FormData();
          pForm.append('name', prod.name.trim());
          if (prod.description) pForm.append('description', prod.description.trim());
          if (prod.price) pForm.append('price', prod.price.trim());
          if (prod.carousel_name) pForm.append('carousel_name', prod.carousel_name.trim());
          pForm.append('is_visible', prod.is_visible !== false ? 'true' : 'false');
          if (prod.stock !== undefined && prod.stock !== '' && prod.stock !== null) pForm.append('stock', prod.stock);
          if (prod.imageFile) pForm.append('image', prod.imageFile);

          const url = prod.id 
            ? `${API_URL}/businesses/${currentSlug}/products/${prod.id}`
            : `${API_URL}/businesses/${currentSlug}/products`;

          try {
            const prodRes = await fetchAuth(url, {
              method: prod.id ? 'PUT' : 'POST',
              body: pForm
            });
            if (!prodRes.ok) {
              const errData = await prodRes.json().catch(() => ({}));
              let errMsg = `Error al guardar el producto "${prod.name}"`;
              if (errData.detail) {
                if (Array.isArray(errData.detail)) {
                  errMsg = errData.detail.map(e => `${e.loc ? e.loc[e.loc.length-1] : 'Campo'}: ${e.msg}`).join('\n');
                } else {
                  errMsg = errData.detail;
                }
              }
              throw new Error(errMsg);
            }
          } catch (e) {
            if (e.message !== 'SESSION_EXPIRED') {
              console.error("Error guardando producto:", e);
              throw e;
            }
          }
        }
      }

      setIsEditing(false);
      setImagePreview(null);
      setDeletedProductsIds([]);
      if (onUpdate) onUpdate();

      if (isCreateMode && currentSlug) {
        navigate(`/perfil/${currentSlug}`);
      }
    } catch (err) {
      console.error(err);
      alert(err.message || "Hubo un error al guardar los cambios.");
    } finally {
      setIsSavingEdit(false);
    }
  };

  // 🧹 LIMPIEZA Y FORMATEO DE ENLACES
  let waNumbers = [];
  try { waNumbers = JSON.parse(profesional?.whatsapp_numbers || '[]'); } catch { waNumbers = []; }
  if (waNumbers.length === 0 && profesional?.whatsapp) waNumbers = [profesional.whatsapp];
  const cleanPhone = profesional?.phone?.replace(/[^0-9]/g, '');
  
  const links = {
    phone: cleanPhone ? `tel:${cleanPhone}` : null,
    facebook: profesional?.facebook,
    instagram: profesional?.instagram,
    linkedin: profesional?.linkedin,
    website: profesional?.website,
    github: profesional?.github,
    tiktok: profesional?.tiktok,
    ubicacion: profesional?.ubicacion_url
  };

  if (!profesional) return null;

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A535C] pb-24 font-sans antialiased selection:bg-[#F9842C] selection:text-white relative">
      
      <ProfileHero 
        profesional={profesional}
        volverAtras={volverAtras}
        isLoggedIn={isLoggedIn}
        userName={userName}
        handleLogout={handleLogout}
        onProtectedAction={onProtectedAction}
        handleShare={handleShare}
        toggleQR={toggleQR}
        isOwner={isOwner}
        isEditing={isEditing}
        setIsEditing={(val) => { setIsEditing(val); if(!val) setImagePreview(null); }}
        toggleSaveCard={toggleSaveCard}
        isSaving={isSaving}
        isSaved={isSaved}
        editFormData={editFormData}
        handleEditChange={handleEditChange}
        handleLinkClick={handleLinkClick}
        links={links}
        imagePreview={imagePreview}
        setEditFormData={setEditFormData}
        isCreateMode={isCreateMode}
        specialtiesData={specialtiesData}
      />

      {/* 🧑‍💼 INFO PRINCIPAL DEL PERFIL */}
      <div className="max-w-4xl mx-auto px-6 sm:px-8 md:px-6 lg:px-8 relative z-20">

        {/* 📦 CATÁLOGO INLINE / EDIT (CARRUSEL O FORMULARIO) */}
        <div className="-mx-4 sm:mx-0 mb-2">
          {isEditing ? (
            <div className="px-4 sm:px-0">
              <ProfileCatalogEdit 
                localProducts={localProducts}
                setLocalProducts={setLocalProducts}
                deletedProductsIds={deletedProductsIds}
                setDeletedProductsIds={setDeletedProductsIds}
                isPremium={profesional.premium === true}
                onHasUnsavedProduct={setHasUnsavedProduct}
                ordersEnabled={editFormData.orders_enabled}
                setOrdersEnabled={(val) => setEditFormData(prev => ({ ...prev, orders_enabled: val }))}
                carouselOrder={editFormData.carousel_order}
                setCarouselOrder={(val) => setEditFormData(prev => ({ ...prev, carousel_order: val }))}
              />
            </div>
          ) : (
            <InlineCatalogCarousel 
              slug={profesional.slug} 
              catalogUrl={profesional.catalog_url}
              whatsappNumber={waNumbers[0] || null}
              businessName={profesional.name}
              country={profesional.country || 'Bolivia'}
              theme="light"
              isPremium={profesional.premium === true}
              ordersEnabled={profesional.orders_enabled !== false}
              carouselOrder={profesional.carousel_order}
            />
          )}
        </div>

        <ProfileAbout 
          profesional={profesional}
          isEditing={isEditing}
          editFormData={editFormData}
          handleEditChange={handleEditChange}
          setEditFormData={setEditFormData}
          specialtiesData={specialtiesData}
        />

        <ProfileContact 
          profesional={profesional}
          waNumbers={waNumbers}
          links={links}
          handleLinkClick={handleLinkClick}
          isEditing={isEditing}
          editFormData={editFormData}
          handleEditChange={handleEditChange}
          setEditFormData={setEditFormData}
        />

        {/* ==========================================
            BOTÓN CALIFICAR EN LA PARTE INFERIOR
            ========================================== */}
        <div className="mt-8 flex justify-center w-full z-10 relative px-4">
          <button
              onClick={handleCalificarClick}
              className="px-8 py-4 rounded-xl bg-[#F9842C] hover:bg-[#e07323] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 w-full max-w-sm border border-gray-200"
          >
              <Star size={18} className="fill-white text-white" /> Danos tu opinión
          </button>
        </div>

        {/* 🚀 FOOTER SPINGAMMA */}
        <div className="mt-12 mb-8 text-center flex flex-col items-center justify-center">
            <a 
              href="https://spingamma.github.io/spingamma-landing/" 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="Ir a la página de SpinGamma"
              className="group flex flex-col items-center gap-1 opacity-70 hover:opacity-100 transition-opacity"
            >
              <span className="text-xs text-[#757778] font-medium">Tecnología desarrollada por</span>
              <span className="text-sm font-extrabold text-[#1A535C] tracking-wider group-hover:text-[#F9842C] transition-colors">SPINGAMMA</span>
            </a>
        </div>
      </div>

      <ProfileQRModal 
        isOpen={mostrarQR}
        onClose={toggleQR}
        url={window.location.href}
        handleDownloadQR={handleDownloadQR}
        handleShare={handleShare}
      />

      <ReviewModal 
        isOpen={mostrarModalCalificando}
        onClose={() => setMostrarModalCalificando(false)}
        onSubmit={handleSubmitReview}
        isSubmitting={isSubmittingReview}
        calificacionPrevia={calificacionPrevia}
        profesionalName={profesional.name}
      />

      <ModalVerificacion 
        isOpen={mostrarModalVerificacion}
        onClose={() => setMostrarModalVerificacion(false)}
        onSuccess={() => {
          setMostrarModalVerificacion(false);
          if (!isCreateMode) {
            setMostrarModalCalificando(true);
          }
        }}
        userName={userName}
      />

      {/* ==========================================
          BARRA DE ACCIONES FLOTANTE (MODO EDICIÓN)
          ========================================== */}
      {isEditing && (
        <div className="fixed bottom-0 left-0 right-0 p-4 sm:p-6 bg-white border-t border-gray-200 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] z-[100] animate-in slide-in-from-bottom-10 flex justify-center items-center gap-4">
          <div className="w-full max-w-4xl mx-auto flex justify-end items-center gap-3">
            <button 
              onClick={() => { 
                if (isCreateMode) {
                  volverAtras();
                } else {
                  setIsEditing(false); 
                  setImagePreview(null); 
                }
              }}
              disabled={isSavingEdit}
              className="px-6 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#757778] font-bold text-sm transition-all shadow-sm"
            >
              Cancelar
            </button>
            <button 
              onClick={handleSaveEdit}
              disabled={isSavingEdit}
              className="px-8 py-3 rounded-xl bg-[#F9842C] hover:bg-[#e06516] text-white font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 min-w-[160px]"
            >
              {isSavingEdit ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              {isSavingEdit ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}