// Archivo: src/pages/AdminPanel/components/AdminVendedorTab.jsx
import { useState, useEffect } from 'react';
import { Search, Loader2, Store, CheckCircle, AlertCircle, XCircle, ArrowRightLeft, Copy, Check } from 'lucide-react';
import fetchAuth from '../../../utils/fetchAuth';

export default function AdminVendedorTab({ API_URL }) {
  const [businesses, setBusinesses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('todos'); // todos, assigned, possible, none
  const [transfering, setTransfering] = useState(null); // { slug, userId }

  const [isAdmin, setIsAdmin] = useState(false);
  const [internalTab, setInternalTab] = useState('mis_ventas'); // mis_ventas, general

  // Estado para código de vendedor
  const [sellerCode, setSellerCode] = useState('');
  const [sellerName, setSellerName] = useState('');
  const [codeCopied, setCodeCopied] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('spingamma_user');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setIsAdmin(parsed.is_admin === true);
      } catch (e) {}
    }
  }, []);

  // Obtener código de vendedor al montar
  useEffect(() => {
    const fetchSellerCode = async () => {
      try {
        const res = await fetchAuth(`${API_URL}/admin/vendedor/my-code`);
        if (res.ok) {
          const data = await res.json();
          setSellerCode(data.seller_code || '');
          setSellerName(data.seller_name || '');
        }
      } catch (err) {
        console.error("Error fetching seller code:", err);
      }
    };
    fetchSellerCode();
  }, [API_URL]);

  const handleCopyCode = async () => {
    if (!sellerCode) return;
    try {
      await navigator.clipboard.writeText(sellerCode);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    } catch (err) {
      // Fallback para navegadores que no soportan clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = sellerCode;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    }
  };

  // Estados para búsqueda manual
  const [manualModalOpen, setManualModalOpen] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [manualSearch, setManualSearch] = useState('');
  const [manualUsers, setManualUsers] = useState([]);
  const [isSearchingManual, setIsSearchingManual] = useState(false);

  useEffect(() => {
    fetchBusinesses();
  }, [API_URL]);

  useEffect(() => {
    if (!manualModalOpen || manualSearch.length < 2) {
      setManualUsers([]);
      return;
    }
    const delayDebounceFn = setTimeout(async () => {
      setIsSearchingManual(true);
      try {
        const res = await fetchAuth(`${API_URL}/admin/users?search=${encodeURIComponent(manualSearch)}`);
        if (res.ok) {
          const data = await res.json();
          setManualUsers(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearchingManual(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [manualSearch, manualModalOpen, API_URL]);

  const fetchBusinesses = async () => {
    setIsLoading(true);
    try {
      const res = await fetchAuth(`${API_URL}/admin/vendedor/businesses`);
      if (res.ok) {
        const data = await res.json();
        setBusinesses(data);
      }
    } catch (err) {
      console.error("Error fetching businesses:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTransfer = async (business, owner) => {
    if (!owner) return;
    
    const confirmMessage = `¿Estás seguro que deseas transferir el negocio "${business.name}" al usuario ${owner.name} (${owner.phone})?`;
    if (!window.confirm(confirmMessage)) return;

    setTransfering(business.slug);
    try {
      const res = await fetchAuth(`${API_URL}/admin/vendedor/businesses/${business.slug}/transfer`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: owner.id })
      });

      if (res.ok) {
        // Actualizar el estado localmente
        setBusinesses(prev => prev.map(b => {
          if (b.slug === business.slug) {
            return { ...b, owner_id: owner.id, possible_owners: [] };
          }
          return b;
        }));
      } else {
        alert("Error al transferir el negocio.");
      }
    } catch (err) {
      console.error(err);
      alert("Ocurrió un error en la transferencia.");
    } finally {
      setTransfering(null);
    }
  };

  const handleManualTransfer = async (user) => {
    if (!selectedBusiness) return;
    const confirmMessage = `¿Estás seguro que deseas transferir "${selectedBusiness.name}" a ${user.name}?`;
    if (!window.confirm(confirmMessage)) return;

    setTransfering(selectedBusiness.slug);
    try {
      const res = await fetchAuth(`${API_URL}/admin/vendedor/businesses/${selectedBusiness.slug}/transfer`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id })
      });

      if (res.ok) {
        setBusinesses(prev => prev.map(b => {
          if (b.slug === selectedBusiness.slug) {
            return { ...b, owner_id: user.id, possible_owners: [] };
          }
          return b;
        }));
        setManualModalOpen(false);
        setManualSearch('');
      } else {
        alert("Error al transferir.");
      }
    } catch (err) {
      alert("Error en la transferencia.");
    } finally {
      setTransfering(null);
    }
  };

  const filteredBusinesses = businesses.filter(b => {
    const matchesSearch = b.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          b.title?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;
    
    // Filtro por pestañas internas para admin
    if (isAdmin && internalTab === 'mis_ventas' && !b.is_mine) return false;
    
    if (filter === 'assigned') return b.owner_id && !b.is_held_by_seller;
    if (filter === 'possible') return b.is_held_by_seller && b.possible_owners && b.possible_owners.length > 0;
    if (filter === 'none') return b.is_held_by_seller && (!b.possible_owners || b.possible_owners.length === 0);
    
    return true; // todos
  });

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
      {/* HEADER DE CONTROLES */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col gap-4 relative z-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-[#1A535C] flex items-center gap-2">
              <Store size={24} className="text-[#F9842C]" />
              Gestión de Ventas
            </h2>
            {/* Código de Vendedor */}
            {sellerCode && (
              <div className="mt-3 flex items-center gap-3 bg-gradient-to-r from-[#1A535C]/5 to-[#F9842C]/5 border border-[#1A535C]/15 rounded-2xl px-4 py-2.5 w-fit">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-[#757778] uppercase tracking-wider">Tu Código de Vendedor</span>
                  <span data-testid="seller-code-display" className="text-lg font-black text-[#1A535C] tracking-widest font-mono">{sellerCode}</span>
                </div>
                <button
                  data-testid="copy-seller-code-btn"
                  onClick={handleCopyCode}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-300 ${
                    codeCopied 
                      ? 'bg-green-100 text-green-700 border border-green-200' 
                      : 'bg-white hover:bg-[#F9842C] hover:text-white text-[#F9842C] border border-[#F9842C]/30 hover:border-transparent shadow-sm'
                  }`}
                  title="Copiar código"
                >
                  {codeCopied ? <Check size={14} /> : <Copy size={14} />}
                  {codeCopied ? '¡Copiado!' : 'Copiar'}
                </button>
              </div>
            )}
            {isAdmin && (
              <div className="flex bg-gray-100 rounded-xl p-1 mt-3 w-fit">
                <button
                  onClick={() => setInternalTab('mis_ventas')}
                  className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${internalTab === 'mis_ventas' ? 'bg-white text-[#F9842C] shadow-sm' : 'text-[#757778] hover:text-[#757778]'}`}
                >
                  Mis Ventas (Pendientes)
                </button>
                <button
                  onClick={() => setInternalTab('general')}
                  className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${internalTab === 'general' ? 'bg-white text-[#F9842C] shadow-sm' : 'text-[#757778] hover:text-[#757778]'}`}
                >
                  General (Todos los Vendedores)
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row w-full lg:w-auto gap-3 items-start sm:items-center flex-wrap">
            <select 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full sm:w-auto bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-xl outline-none focus:border-[#F9842C] focus:ring-1 focus:ring-[#F9842C]/30 text-sm font-bold text-[#1A535C] appearance-none"
            >
              <option value="todos">Todos los Negocios</option>
              <option value="possible">Con Posible Dueño</option>
              <option value="none">Sin Usuario Registrado</option>
              <option value="assigned">Dueño Asignado</option>
            </select>

            <div className="relative w-full sm:w-64">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Buscar negocio..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-gray-200 py-2.5 pl-11 pr-4 rounded-xl outline-none focus:border-[#F9842C] focus:ring-1 focus:ring-[#F9842C]/10 transition-all font-medium text-[#1A535C]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* LISTADO DE NEGOCIOS */}
      {isLoading ? (
        <div className="py-20 flex justify-center">
          <Loader2 size={40} className="animate-spin text-[#F9842C]" />
        </div>
      ) : filteredBusinesses.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-gray-100 shadow-sm">
          <Store size={48} className="mx-auto mb-4 text-gray-200" />
          <p className="text-gray-400 font-bold text-lg">No hay negocios que coincidan con los filtros.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBusinesses.map(b => (
            <div key={b.slug} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col h-full hover:shadow-md transition-shadow group">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden shrink-0">
                  <img 
                    src={b.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(b.name)}&background=F8F9FA&color=1E3D51`} 
                    alt={b.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-[#1A535C] truncate" title={b.name}>{b.name}</h3>
                  <p className="text-xs text-[#757778] truncate">{b.title || 'Sin título'}</p>
                </div>
              </div>
              
              <div className="mt-auto pt-4 border-t border-gray-50">
                <div className="p-4 bg-gray-50 flex flex-col gap-3">
                  {b.owner_id && !b.is_held_by_seller ? (
                    <div className="flex items-center gap-2 text-[#1A535C] bg-[#1A535C]/10 p-3 rounded-xl border border-[#1A535C]/20">
                      <CheckCircle size={18} className="shrink-0" />
                      <div>
                        <p className="text-xs font-bold">Dueño Asignado</p>
                        <p className="text-[10px] text-[#1A535C]/80">Transferido exitosamente.</p>
                      </div>
                    </div>
                  ) : b.is_held_by_seller ? (
                    <div className="flex items-center gap-2 text-orange-600 bg-orange-50 p-3 rounded-xl border border-orange-100">
                      <Store size={18} className="shrink-0" />
                      <div>
                        <p className="text-xs font-bold">Pendiente de Vender</p>
                        <p className="text-[10px] text-orange-600/80">Vendedor actual: {b.owner_name}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-[#757778] bg-gray-50 p-3 rounded-xl border border-gray-100">
                      <XCircle size={18} className="shrink-0" />
                      <div>
                        <p className="text-xs font-bold">Sin usuario registrado</p>
                        <p className="text-[10px] text-[#757778]/80">Nadie se registró con este WhatsApp.</p>
                      </div>
                    </div>
                  )}

                  {b.is_held_by_seller && b.possible_owners && b.possible_owners.length > 0 && (
                    <div className="flex flex-col gap-3 mt-1">
                      {b.possible_owners.map((po, idx) => (
                        <div key={idx} className="flex flex-col gap-2 p-3 rounded-xl border border-[#F9842C]/20 bg-[#F9842C]/5 relative">
                          <div className="flex items-start gap-2 text-[#F9842C]">
                            <AlertCircle size={18} className="shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold truncate">Posible Dueño: {po.name}</p>
                              <p className="text-[10px] text-[#F9842C]/80">{po.phone}</p>
                            </div>
                          </div>
                          <button 
                            onClick={() => handleTransfer(b, po)}
                            disabled={transfering === b.slug}
                            className="w-full bg-[#1A535C] hover:bg-[#152b39] text-white py-1.5 rounded-lg text-[11px] font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                          >
                            {transfering === b.slug ? <Loader2 size={12} className="animate-spin" /> : <ArrowRightLeft size={12} />}
                            Transferir a {po.name.split(' ')[0]}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>                
                {/* Botón de asignación manual siempre disponible si está retenido por un vendedor o no tiene dueño */}
                {(!b.owner_id || b.is_held_by_seller) && (
                  <button
                    onClick={() => { setSelectedBusiness(b); setManualModalOpen(true); }}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-[#757778] py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                  >
                    <Search size={14} /> Transferir Manualmente
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL ASIGNACIÓN MANUAL */}
      {manualModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#1A535C]/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div>
                <h3 className="font-extrabold text-[#1A535C] text-lg">Asignar Dueño Manual</h3>
                <p className="text-xs text-[#757778]">Negocio: {selectedBusiness?.name}</p>
              </div>
              <button onClick={() => setManualModalOpen(false)} className="text-gray-400 hover:text-[#757778] bg-white p-2 rounded-full shadow-sm">
                <XCircle size={24} />
              </button>
            </div>
            
            <div className="p-6 flex-1 overflow-y-auto">
              <div className="relative mb-6">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Buscar usuario por nombre o celular..." 
                  value={manualSearch}
                  onChange={(e) => setManualSearch(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 py-3 pl-11 pr-4 rounded-xl outline-none focus:border-[#F9842C] focus:ring-1 focus:ring-[#F9842C]/10 text-sm font-medium text-[#1A535C]"
                />
                {isSearchingManual && <Loader2 size={16} className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-[#F9842C]" />}
              </div>

              <div className="space-y-3">
                {manualUsers.map(u => (
                  <div key={u.id} className="flex justify-between items-center p-3 rounded-xl border border-gray-100 hover:border-[#F9842C]/30 transition-all bg-white hover:shadow-sm">
                    <div>
                      <p className="font-bold text-sm text-[#1A535C]">{u.name}</p>
                      <p className="text-xs text-[#757778]">{u.phone}</p>
                    </div>
                    <button 
                      onClick={() => handleManualTransfer(u)}
                      disabled={transfering === selectedBusiness?.slug}
                      className="bg-[#10B981] hover:bg-[#0d9b6c] text-white px-3 py-1.5 rounded-lg text-xs font-bold disabled:opacity-50"
                    >
                      Asignar
                    </button>
                  </div>
                ))}
                {manualSearch.length >= 2 && manualUsers.length === 0 && !isSearchingManual && (
                  <p className="text-center text-sm text-gray-400 py-4">No se encontraron usuarios.</p>
                )}
                {manualSearch.length < 2 && (
                  <p className="text-center text-sm text-gray-400 py-4">Escribe al menos 2 caracteres para buscar...</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
