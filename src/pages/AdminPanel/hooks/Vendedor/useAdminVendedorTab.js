import { useState, useEffect, useCallback } from 'react';
import fetchAuth from '../../../../utils/fetchAuth';

export function useAdminVendedorTab(API_URL) {
  const [businesses, setBusinesses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('none'); // todos, assigned, possible, none
  const [transfering, setTransfering] = useState(null); // { slug, userId }

  const [isAdmin, setIsAdmin] = useState(false);
  const [internalTab, setInternalTab] = useState('mis_ventas'); // mis_ventas, general

  const [sellerCode, setSellerCode] = useState('');
  const [sellerName, setSellerName] = useState('');
  const [codeCopied, setCodeCopied] = useState(false);

  // Estados para búsqueda manual
  const [manualModalOpen, setManualModalOpen] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [manualSearch, setManualSearch] = useState('');
  const [manualUsers, setManualUsers] = useState([]);
  const [isSearchingManual, setIsSearchingManual] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('spingamma_user');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setIsAdmin(parsed.is_admin === true);
      } catch { /* ignore */ }
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
    } catch {
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

  const fetchBusinesses = useCallback(async () => {
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
  }, [API_URL]);

  useEffect(() => {
    fetchBusinesses();
  }, [fetchBusinesses]);

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
    } catch {
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

  return {
    businesses,
    searchTerm,
    setSearchTerm,
    isLoading,
    filter,
    setFilter,
    transfering,
    isAdmin,
    internalTab,
    setInternalTab,
    sellerCode,
    sellerName,
    codeCopied,
    handleCopyCode,
    manualModalOpen,
    setManualModalOpen,
    selectedBusiness,
    setSelectedBusiness,
    manualSearch,
    setManualSearch,
    manualUsers,
    isSearchingManual,
    handleTransfer,
    handleManualTransfer,
    filteredBusinesses
  };
}
