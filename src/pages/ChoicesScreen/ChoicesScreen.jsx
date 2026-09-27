import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Check, CheckCircle2, ChevronRight, Sparkles } from 'lucide-react';

export default function ChoicesScreen() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { cart, deliveryMethods, paymentQrImage, ownerId } = location.state || {};

  const token = localStorage.getItem('spingamma_token');

  const cartEntries = Object.entries(cart || {});

  // Parse available choices per item
  const parsedItems = cartEntries.map(([key, item]) => {
    let choices = [];
    if (item?.product?.choices) {
      try {
        choices = typeof item.product.choices === 'string'
          ? JSON.parse(item.product.choices)
          : item.product.choices;
        if (!Array.isArray(choices)) choices = [];
      } catch {
        choices = [];
      }
    }
    return {
      key,
      item,
      choices
    };
  });

  // State: selected choices per product key (called unconditionally before early returns)
  const [selectedChoices, setSelectedChoices] = useState(() => {
    const initial = {};
    parsedItems.forEach(({ key, item }) => {
      if (item?.selected_choices) {
        try {
          const parsed = typeof item.selected_choices === 'string'
            ? JSON.parse(item.selected_choices)
            : item.selected_choices;
          if (Array.isArray(parsed)) initial[key] = parsed;
        } catch {
          initial[key] = [];
        }
      } else {
        initial[key] = [];
      }
    });
    return initial;
  });

  // Guard: not logged in
  if (!token) {
    return (
      <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-xl font-bold text-primary mb-4">Debes iniciar sesión</h2>
        <p className="mb-6 text-gray-500">Para continuar necesitas estar registrado e iniciar sesión.</p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-secondary text-white rounded-xl font-bold"
          data-testid="login-home-btn"
        >
          Ir al Inicio para ingresar
        </button>
      </div>
    );
  }

  // Guard: empty cart
  if (!cart || Object.keys(cart).length === 0) {
    return (
      <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-xl font-bold text-primary mb-4">No hay productos en tu orden</h2>
        <button
          onClick={() => navigate(`/perfil/${slug}`)}
          className="px-6 py-3 bg-secondary text-white rounded-xl font-bold"
          data-testid="back-to-profile-btn"
        >
          Volver al perfil
        </button>
      </div>
    );
  }

  const toggleChoice = (productKey, choice) => {
    setSelectedChoices(prev => {
      const currentList = prev[productKey] || [];
      const exists = currentList.includes(choice);
      const nextList = exists
        ? currentList.filter(c => c !== choice)
        : [...currentList, choice];
      return {
        ...prev,
        [productKey]: nextList
      };
    });
  };

  const handleContinue = () => {
    const enrichedCart = {};
    cartEntries.forEach(([key, item]) => {
      const choices = selectedChoices[key] || [];
      enrichedCart[key] = {
        ...item,
        selected_choices: choices.length > 0 ? JSON.stringify(choices) : null
      };
    });

    navigate(`/perfil/${slug}/orden`, {
      state: {
        cart: enrichedCart,
        slug,
        deliveryMethods,
        paymentQrImage,
        ownerId
      }
    });
  };

  return (
    <div className="min-h-screen bg-brand-bg text-primary pb-28">
      {/* Top Header */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-xs px-4 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors"
            data-testid="back-button-choices"
            aria-label="Volver"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-base font-extrabold tracking-tight">Complementos de tu Pedido</h1>
            <p className="text-[11px] text-gray-500">Personaliza tus productos a gusto</p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs font-bold text-secondary bg-orange-50 px-2.5 py-1 rounded-full border border-orange-100">
          <Sparkles size={12} />
          <span>A elección</span>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 mt-5 space-y-4">
        {parsedItems.map(({ key, item, choices }) => {
          const hasChoices = choices.length > 0;
          const currentSelected = selectedChoices[key] || [];

          return (
            <div
              key={key}
              data-testid={`choices-card-${item.product.id || key}`}
              className="bg-white rounded-3xl p-5 shadow-xs border border-gray-100"
            >
              {/* Product Header */}
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  {item.product.image_url ? (
                    <img
                      src={item.product.image_url}
                      alt={item.product.name}
                      className="w-12 h-12 rounded-2xl object-cover border border-gray-100 shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-2xl bg-orange-50 text-secondary flex items-center justify-center font-bold text-sm shrink-0">
                      {item.quantity}x
                    </div>
                  )}
                  <div>
                    <h2 className="font-extrabold text-sm text-primary leading-snug">
                      {item.product.name}
                    </h2>
                    <p className="text-xs text-gray-400 font-medium">
                      Cantidad: <span className="font-bold text-gray-700">{item.quantity}</span>
                    </p>
                  </div>
                </div>

                {!hasChoices ? (
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 shrink-0">
                    <CheckCircle2 size={12} />
                    Listo
                  </span>
                ) : (
                  <span className="text-[11px] font-bold text-secondary bg-orange-50 px-2.5 py-1 rounded-full border border-orange-200/50 shrink-0">
                    {currentSelected.length} selec.
                  </span>
                )}
              </div>

              {/* Choices List */}
              {hasChoices ? (
                <div className="pt-3">
                  <p className="text-[11px] uppercase font-bold text-gray-400 tracking-wider mb-2.5">
                    Selecciona los complementos que deseas:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {choices.map((choice, idx) => {
                      const isChecked = currentSelected.includes(choice);
                      return (
                        <label
                          key={idx}
                          data-testid={`choice-option-${key}-${idx}`}
                          className={`flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${
                            isChecked
                              ? 'bg-orange-50/70 border-secondary text-primary shadow-xs'
                              : 'bg-gray-50/50 border-gray-100 text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-all ${
                              isChecked
                                ? 'bg-secondary border-secondary text-white'
                                : 'border-gray-300 bg-white'
                            }`}
                          >
                            {isChecked && <Check size={14} className="stroke-[3]" />}
                          </div>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleChoice(key, choice)}
                            data-testid={`choice-checkbox-${key}-${idx}`}
                            className="hidden"
                          />
                          <span className="text-xs font-bold select-none">{choice}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="pt-2">
                  <p className="text-xs text-gray-400 italic">
                    Este producto no requiere complementos ni opciones adicionales.
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Floating Continue Button */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-100 p-4 shadow-lg">
        <div className="max-w-xl mx-auto">
          <button
            onClick={handleContinue}
            data-testid="continue-to-order-btn"
            className="w-full bg-secondary hover:bg-secondary/90 text-white font-bold py-3.5 px-6 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 text-sm"
          >
            <span>Continuar al Pedido</span>
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
