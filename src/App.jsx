// Archivo: src/App.jsx
import { useState, useEffect, useMemo, Suspense, lazy, useRef, useCallback } from 'react';
import { Routes, Route, useNavigate, Link } from 'react-router-dom'; 
import { 
  Search, Briefcase, Scale, Stethoscope, Calculator, 
  PenTool, Laptop, MapPin, CheckCircle2, LayoutGrid, Home, Brain, UserPlus, X, Star, LogOut,
  LayoutList, ChevronLeft, ChevronRight, ChevronDown, Building, Shield
} from 'lucide-react';
import AuthModal from './components/AuthModal';
import InstallPrompt from './components/InstallPrompt';

// Lazy load de Vistas
const Perfil = lazy(() => import('./Perfil'));  
const CrearNegocio = lazy(() => import('./CrearNegocio'));
const MisNegocios = lazy(() => import('./MisNegocios'));
const AdminPanel = lazy(() => import('./AdminPanel'));

const normalizeText = (text) => {
  if (!text) return '';
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
};

const isValidValue = (val) => {
  if (!val) return false;
  const normalized = val.toString().trim().toLowerCase();
  return !['n/a', 'na', 'null', 'undefined', 'ninguno', 'ninguna', '-', 'none'].includes(normalized);
};

const getCategoryIcon = (categoryName) => {
  const name = normalizeText(categoryName);
  if (name.includes('abogado') || name.includes('legal')) return <Scale size={24} />;
  if (name.includes('medic') || name.includes('salud')) return <Stethoscope size={24} />;
  if (name.includes('conta') || name.includes('finanz')) return <Calculator size={24} />;
  if (name.includes('diseñ') || name.includes('arte')) return <PenTool size={24} />;
  if (name.includes('tecno') || name.includes('sistem')) return <Laptop size={24} />;
  if (name.includes('inmo') || name.includes('casa') || name.includes('prop')) return <Home size={24} />;
  if (name.includes('psico') || name.includes('mente') || name.includes('terapia')) return <Brain size={24} />;
  if (name === 'todos') return <LayoutGrid size={24} />;
  return <Briefcase size={24} />; 
};

function Directorio() {
  const [profesionales, setProfesionales] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mensajeCarga, setMensajeCarga] = useState("Cargando directorio SPINJOB...");
  const navigate = useNavigate();
  
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');

  const [activeState, setActiveState] = useState('Todas');
  const [activeNeighborhood, setActiveNeighborhood] = useState('Todas');
  const [activeRating, setActiveRating] = useState('Todos');
  const [activeSubcategory, setActiveSubcategory] = useState('Todas');
  const [openDropdown, setOpenDropdown] = useState(null); // 'category', 'location', 'rating'
  const [catSearch, setCatSearch] = useState('');
  const [locSearch, setLocSearch] = useState('');

  // Estados de Autenticación
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('spingamma_user') !== null);
  const [userName, setUserName] = useState(() => {
    const stored = localStorage.getItem('spingamma_user');
    if (stored) {
      try { return JSON.parse(stored).nombre; } catch(e) { return ''; }
    }
    return '';
  });
  
  // NUEVO: Estado para saber si es Admin
  const [isAdmin, setIsAdmin] = useState(() => {
    const stored = localStorage.getItem('spingamma_user');
    if (stored) {
      try { return JSON.parse(stored).is_admin === true; } catch(e) { return false; }
    }
    return false;
  });
  
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [pendingSlug, setPendingSlug] = useState(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

    const cargarDirectorio = async (intentos = 0) => {
      try {
        const res = await fetch(`${API_URL}/businesses/`);
        if (!res.ok) throw new Error("Error en red");
        
        const data = await res.json();
        if (isMounted) {
          setProfesionales(data);
          setCargando(false);
        }
      } catch (err) {
        if (intentos < 12 && isMounted) {
          if (intentos === 2) setMensajeCarga("Despertando conexión segura...");
          setTimeout(() => cargarDirectorio(intentos + 1), 4000);
        } else if (isMounted) {
          setProfesionales([]);
          setCargando(false);
        }
      }
    };
    cargarDirectorio();
    return () => { isMounted = false; };
  }, []);

  const groupedCategories = useMemo(() => {
    const catsFromDB = [...new Set(profesionales.map(p => p.category).filter(isValidValue))].sort();
    return catsFromDB.map(c => {
      const subs = [...new Set(profesionales.filter(p => p.category === c).map(p => p.subcategory).filter(isValidValue))].sort();
      return { category: c, subcategories: subs };
    });
  }, [profesionales]);

  const groupedLocations = useMemo(() => {
    const statesFromDB = [...new Set(profesionales.map(p => p.state).filter(isValidValue))].sort();
    return statesFromDB.map(s => {
      const neighs = [...new Set(profesionales.filter(p => p.state === s).map(p => p.neighborhood).filter(isValidValue))].sort();
      return { state: s, neighborhoods: neighs };
    });
  }, [profesionales]);

  const filteredGroupedCategories = useMemo(() => {
    const search = normalizeText(catSearch);
    if (!search) return groupedCategories;
    return groupedCategories.map(group => {
      const matchCategory = normalizeText(group.category).includes(search);
      const filteredSubs = group.subcategories.filter(sub => normalizeText(sub).includes(search));
      if (matchCategory || filteredSubs.length > 0) {
        return { ...group, subcategories: filteredSubs };
      }
      return null;
    }).filter(Boolean);
  }, [groupedCategories, catSearch]);

  const filteredGroupedLocations = useMemo(() => {
    const search = normalizeText(locSearch);
    if (!search) return groupedLocations;
    return groupedLocations.map(group => {
      const matchState = normalizeText(group.state).includes(search);
      const filteredNeighs = group.neighborhoods.filter(n => normalizeText(n).includes(search));
      if (matchState || filteredNeighs.length > 0) {
        return { ...group, neighborhoods: filteredNeighs };
      }
      return null;
    }).filter(Boolean);
  }, [groupedLocations, locSearch]);

  // Reset subcategory and neighborhood when their parents change (managed in click handlers now)

  const filteredProfessionals = profesionales
    .filter(p => {
      const matchCategory = activeCategory === 'Todos' || p.category === activeCategory;
      const searchNormalized = normalizeText(searchTerm);
      const matchSearch = normalizeText(p.name).includes(searchNormalized) || 
                          normalizeText(p.title).includes(searchNormalized);
      const matchState = activeState === 'Todas' || p.state === activeState;
      const matchNeighborhood = activeNeighborhood === 'Todas' || p.neighborhood === activeNeighborhood;
      const matchSubcategory = activeSubcategory === 'Todas' || p.subcategory === activeSubcategory;
      
      let matchRating = true;
      if (activeRating === '5 Estrellas') matchRating = (p.rating || 0) >= 5;
      else if (activeRating === '4+ Estrellas') matchRating = (p.rating || 0) >= 4;
      else if (activeRating === '3+ Estrellas') matchRating = (p.rating || 0) >= 3;

      return matchCategory && matchSearch && matchState && matchNeighborhood && matchRating && matchSubcategory;
    })
    .sort((a, b) => (b.rating || 0) - (a.rating || 0));

  const handleLogout = () => {
    localStorage.removeItem('spingamma_user');
    setIsLoggedIn(false);
    setUserName('');
    setIsAdmin(false);
  };

  // Manejo de Dropdowns Custom
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openDropdown && !event.target.closest('.custom-dropdown')) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openDropdown]);

  const toggleDropdown = (id) => {
    const isNowOpen = openDropdown !== id;
    setOpenDropdown(isNowOpen ? id : null);
    if (!isNowOpen) {
      setCatSearch('');
      setLocSearch('');
    }
  };

  const handleSelectOption = (type, value, subValue = null) => {
    if (type === 'category') {
      setActiveCategory(value);
      setActiveSubcategory(subValue || 'Todas');
    }
    if (type === 'location') {
      setActiveState(value);
      setActiveNeighborhood(subValue || 'Todas');
    }
    if (type === 'rating') setActiveRating(value);
    setOpenDropdown(null);
    setCatSearch('');
    setLocSearch('');
  };



  const handleRegisterSuccess = (formData) => {
    localStorage.setItem('spingamma_user', JSON.stringify(formData));
    setIsLoggedIn(true);
    setUserName(formData.nombre);
    // NUEVO: Leemos si el backend nos dijo que es admin
    setIsAdmin(formData.is_admin === true);
    setAuthModalOpen(false);
    if (pendingSlug) {
      navigate(`/perfil/${pendingSlug}`);
      setPendingSlug(null);
    }
  };

  const handleCardClick = (slug) => {
    setPendingSlug(slug);
    setAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1E3D51] font-sans pb-12 antialiased selection:bg-[#B95221] selection:text-white relative">
      
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm h-16 md:h-20 flex items-center">
        <div className="w-full max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 flex items-center justify-between gap-2">
          
          <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-10 h-10 bg-[#B95221] rounded-xl flex items-center justify-center shadow-md">
              <Briefcase className="text-white w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <span className="font-extrabold text-xl lg:text-2xl tracking-tight text-[#1E3D51] uppercase hidden md:block ml-3">SPINJOB</span>
          </div>
          
          <div className="flex-1 max-w-2xl">
            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-full shadow-inner py-1.5 px-2.5 focus-within:ring-2 focus-within:ring-[#B95221] transition-all">
              <Search size={16} className="text-[#32698F] mr-1.5 sm:mr-2 flex-shrink-0" />
              <input 
                type="text" 
                aria-label="Buscar profesional" 
                placeholder="Buscar profesional..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)} 
                className="w-full bg-transparent text-[#1E3D51] placeholder-gray-400 outline-none text-[13px] sm:text-base" 
              />
            </div>
          </div>

          {/* ZONA DE USUARIO / MENÚ DESPLEGABLE */}
          <div className="flex items-center flex-shrink-0 relative">
            {isLoggedIn ? (
              <>
                {isUserMenuOpen && (
                  <div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)}></div>
                )}

                <div className="relative z-50">
                  <button 
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-1.5 sm:gap-2 bg-white hover:bg-gray-50 border border-gray-200 py-1 sm:py-1.5 px-1.5 sm:px-3 rounded-full shadow-sm transition-all"
                  >
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#B95221] flex items-center justify-center shadow-inner flex-shrink-0">
                      <span className="text-white font-bold text-xs sm:text-sm">
                        {userName ? userName.charAt(0).toUpperCase() : 'U'}
                      </span>
                    </div>
                    <span className="text-sm text-gray-600 hidden lg:block mr-1 truncate max-w-[100px]">
                      Hola, <strong className="text-[#1E3D51] font-semibold">{userName.split(' ')[0]}</strong>
                    </span>
                    <ChevronDown size={16} className={`text-gray-400 transition-transform duration-300 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* MENÚ FLOTANTE */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="p-2 space-y-1">
                        
                        <Link 
                          to="/mis-negocios" 
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-[#1E3D51] hover:bg-orange-50 hover:text-[#B95221] rounded-xl transition-colors"
                        >
                          <Building size={18} /> Mis Negocios
                        </Link>
                        
                        {/* NUEVO: ESTE BOTÓN AHORA SOLO SE RENDERIZA SI ES ADMIN */}
                        {isAdmin && (
                          <Link 
                            to="/admin" 
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                          >
                            <Shield size={18} /> Panel Admin
                          </Link>
                        )}

                        <div className="h-[1px] bg-gray-100 my-1"></div>

                        <button 
                          onClick={() => { handleLogout(); setIsUserMenuOpen(false); }} 
                          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-gray-500 hover:bg-gray-50 hover:text-gray-700 rounded-xl transition-colors"
                        >
                          <LogOut size={18} /> Cerrar sesión
                        </button>

                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <button 
                onClick={() => setAuthModalOpen(true)} 
                className="flex items-center justify-center bg-[#32698F] hover:bg-[#1E3D51] text-white py-1.5 sm:py-2 px-3 sm:px-4 rounded-full transition-colors shadow-sm"
              >
                <UserPlus size={16} className="md:hidden" />
                <span className="text-sm font-semibold hidden md:block">Ingresar</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* BARRA DE FILTROS PREMIUM CUSTOM (2x2 Grid) */}
      <div className="bg-white/70 backdrop-blur-md sticky top-16 md:top-20 z-30 border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 md:py-4">
          <div className="grid grid-cols-3 gap-2 md:gap-4">
            
            {/* Especialidad y Subespecialidad agrupada */}
            <div className="flex flex-col gap-1 relative custom-dropdown">
              <label className="text-[9px] md:text-[10px] font-bold text-[#B95221] uppercase tracking-widest ml-1 hidden sm:block">Servicio</label>
              <button 
                onClick={() => toggleDropdown('category')}
                className={`flex items-center bg-white border rounded-xl px-1.5 md:px-3 py-2.5 md:py-2.5 shadow-sm transition-all hover:bg-gray-50 group focus:outline-none
                  ${openDropdown === 'category' ? 'border-[#B95221] ring-1 ring-[#B95221]/30' : 'border-gray-200'}
                `}
              >
                <LayoutGrid size={14} className={`mr-1 md:mr-2 flex-shrink-0 transition-colors ${openDropdown === 'category' ? 'text-[#B95221]' : 'text-[#32698F]'}`} />
                <span className="w-full text-left text-xs sm:text-sm text-[#1E3D51] font-extrabold truncate">
                  {activeCategory === 'Todos' ? (
                    <>
                      <span className="hidden md:inline">Cualquier </span>Servicio
                    </>
                  ) : (activeSubcategory !== 'Todas' ? activeSubcategory : activeCategory)}
                </span>
                <ChevronDown size={11} className={`text-gray-400 ml-0.5 md:ml-1 flex-shrink-0 transition-transform duration-300 ${openDropdown === 'category' ? 'rotate-180 text-[#B95221]' : ''}`} />
              </button>

              {openDropdown === 'category' && (
                <div className="absolute top-full left-0 mt-2 bg-white/95 backdrop-blur-xl border border-gray-100 rounded-2xl shadow-2xl z-50 py-2 w-[260px] md:w-full max-h-80 overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
                  <div className="px-4 py-2 sticky top-0 bg-white/80 backdrop-blur-md z-10 border-b border-gray-50 mb-1">
                    <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 focus-within:ring-1 focus-within:ring-[#B95221]/50">
                      <Search size={14} className="text-gray-400 mr-2" />
                      <input 
                        type="text"
                        placeholder="Buscar servicio..."
                        value={catSearch}
                        onChange={(e) => setCatSearch(e.target.value)}
                        className="w-full bg-transparent text-sm outline-none placeholder-gray-400"
                        autoFocus
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => handleSelectOption('category', 'Todos')}
                    className={`w-full text-left px-5 py-3 text-sm font-extrabold transition-colors
                      ${activeCategory === 'Todos' ? 'bg-[#B95221]/10 text-[#B95221]' : 'text-[#B95221] hover:bg-gray-50'}
                    `}
                  >
                    Mostrar todas las especialidades
                  </button>
                  {filteredGroupedCategories.map(group => (
                    <div key={group.category} className="border-t border-gray-100 my-1 pt-2 pb-1">
                      <button
                        onClick={() => handleSelectOption('category', group.category)}
                        className={`w-full text-left px-5 py-2 text-sm font-bold transition-colors
                          ${activeCategory === group.category && activeSubcategory === 'Todas' ? 'text-[#B95221] bg-orange-50/50' : 'text-[#1E3D51] hover:bg-gray-50'}
                        `}
                      >
                        {group.category}
                      </button>
                      {group.subcategories.map(sub => (
                        <button
                          key={sub}
                          onClick={() => handleSelectOption('category', group.category, sub)}
                          className={`w-full text-left pl-9 pr-5 py-2 text-[13px] font-medium transition-colors
                            ${activeSubcategory === sub ? 'text-[#B95221] font-bold bg-[#B95221]/5' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'}
                          `}
                        >
                          • {sub}
                        </button>
                      ))}
                    </div>
                  ))}
                  {filteredGroupedCategories.length === 0 && (
                    <div className="px-5 py-8 text-center text-gray-400 text-sm">
                      No se encontraron servicios
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Ubicación Agrupada */}
            <div className="flex flex-col gap-1 relative custom-dropdown">
              <label className="text-[9px] md:text-[10px] font-bold text-[#B95221] uppercase tracking-widest ml-1 hidden sm:block">Ubicación</label>
              <button 
                onClick={() => toggleDropdown('location')}
                className={`flex items-center bg-white border rounded-xl px-1.5 md:px-3 py-2.5 md:py-2.5 shadow-sm transition-all hover:bg-gray-50 group focus:outline-none
                  ${openDropdown === 'location' ? 'border-[#B95221] ring-1 ring-[#B95221]/30' : 'border-gray-200'}
                `}
              >
                <MapPin size={14} className={`mr-1 md:mr-2 flex-shrink-0 transition-colors ${openDropdown === 'location' ? 'text-[#B95221]' : 'text-[#32698F]'}`} />
                <span className="w-full text-left text-xs sm:text-sm text-[#1E3D51] font-extrabold truncate">
                  {activeState === 'Todas' ? (
                    <>
                      <span className="hidden md:inline">Cualquier </span>Ubicación
                    </>
                  ) : (activeNeighborhood !== 'Todas' ? activeNeighborhood : activeState)}
                </span>
                <ChevronDown size={11} className={`text-gray-400 ml-0.5 md:ml-1 flex-shrink-0 transition-transform duration-300 ${openDropdown === 'location' ? 'rotate-180 text-[#B95221]' : ''}`} />
              </button>

              {openDropdown === 'location' && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white/95 backdrop-blur-xl border border-gray-100 rounded-2xl shadow-2xl z-50 py-2 w-[260px] md:w-full max-h-80 overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
                  <div className="px-4 py-2 sticky top-0 bg-white/80 backdrop-blur-md z-10 border-b border-gray-50 mb-1">
                    <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 focus-within:ring-1 focus-within:ring-[#B95221]/50">
                      <Search size={14} className="text-gray-400 mr-2" />
                      <input 
                        type="text"
                        placeholder="Buscar ubicación..."
                        value={locSearch}
                        onChange={(e) => setLocSearch(e.target.value)}
                        className="w-full bg-transparent text-sm outline-none placeholder-gray-400"
                        autoFocus
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => handleSelectOption('location', 'Todas')}
                    className={`w-full text-left px-5 py-3 text-sm font-extrabold transition-colors
                      ${activeState === 'Todas' ? 'bg-[#B95221]/10 text-[#B95221]' : 'text-[#B95221] hover:bg-gray-50'}
                    `}
                  >
                    🌎 Toda Bolivia
                  </button>
                  {filteredGroupedLocations.map(group => (
                    <div key={group.state} className="border-t border-gray-100 my-1 pt-2 pb-1">
                      <button
                        onClick={() => handleSelectOption('location', group.state)}
                        className={`w-full text-left px-5 py-2 text-sm font-bold transition-colors
                          ${activeState === group.state && activeNeighborhood === 'Todas' ? 'text-[#B95221] bg-orange-50/50' : 'text-[#1E3D51] hover:bg-gray-50'}
                        `}
                      >
                        📍 {group.state}
                      </button>
                      {group.neighborhoods.map(neigh => (
                        <button
                          key={neigh}
                          onClick={() => handleSelectOption('location', group.state, neigh)}
                          className={`w-full text-left pl-9 pr-5 py-2 text-[13px] font-medium transition-colors
                            ${activeNeighborhood === neigh ? 'text-[#B95221] font-bold bg-[#B95221]/5' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'}
                          `}
                        >
                          • {neigh}
                        </button>
                      ))}
                    </div>
                  ))}
                  {filteredGroupedLocations.length === 0 && (
                    <div className="px-5 py-8 text-center text-gray-400 text-sm">
                      No se encontraron ubicaciones
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Calificación */}
            <div className="flex flex-col gap-1 relative custom-dropdown">
              <label className="text-[9px] md:text-[10px] font-bold text-[#B95221] uppercase tracking-widest ml-1 hidden sm:block">Calificación</label>
              <button 
                onClick={() => toggleDropdown('rating')}
                className={`flex items-center bg-white border rounded-xl px-1.5 md:px-3 py-2.5 md:py-2.5 shadow-sm transition-all hover:bg-gray-50 group focus:outline-none
                  ${openDropdown === 'rating' ? 'border-[#B95221] ring-1 ring-[#B95221]/30' : 'border-gray-200'}
                `}
              >
                <Star size={14} className={`mr-1 md:mr-2 flex-shrink-0 transition-colors ${openDropdown === 'rating' ? 'fill-[#B95221] text-[#B95221]' : 'text-[#F67927]'}`} />
                <span className="w-full text-left text-xs md:text-sm text-[#1E3D51] font-extrabold truncate">
                  {activeRating === 'Todos' ? (
                    <>
                      <span className="hidden md:inline">Cualquier </span>Ranking
                    </>
                  ) : activeRating.replace(' Estrellas', '')}
                </span>
                <ChevronDown size={11} className={`text-gray-400 ml-0.5 md:ml-1 flex-shrink-0 transition-transform duration-300 ${openDropdown === 'rating' ? 'rotate-180 text-[#B95221]' : ''}`} />
              </button>

              {openDropdown === 'rating' && (
                <div className="absolute top-full right-0 mt-2 bg-white/95 backdrop-blur-xl border border-gray-100 rounded-2xl shadow-2xl z-50 py-2 w-[220px] md:w-full animate-in fade-in zoom-in-95 duration-200">
                  {[
                    { label: 'Cualquiera', value: 'Todos' },
                    { label: 'Solo 5 Estrellas', value: '5 Estrellas' },
                    { label: '4+ Estrellas', value: '4+ Estrellas' },
                    { label: '3+ Estrellas', value: '3+ Estrellas' }
                  ].map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => handleSelectOption('rating', opt.value)}
                      className={`w-full text-left px-5 py-3 text-sm font-bold transition-colors
                        ${activeRating === opt.value ? 'bg-[#B95221]/10 text-[#B95221]' : 'text-gray-600 hover:bg-gray-50'}
                      `}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        {cargando ? (
          <div className="text-center py-20 flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#B95221] mb-4"></div>
            <p className="text-[#1E3D51] font-bold text-lg mb-2">{mensajeCarga}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProfessionals.map((prof) => (
              <Link 
                key={prof.slug} 
                to={isLoggedIn ? `/perfil/${prof.slug}` : "#"}
                onClick={(e) => {
                  if (!isLoggedIn) {
                    e.preventDefault();
                    handleCardClick(prof.slug);
                  }
                }}
                className="group flex flex-col h-full bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-4 transform hover:-translate-y-1 border border-gray-100 hover:border-[#B95221]/30"
              >
                <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-50 mb-4">
                  <img 
                    src={prof.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(prof.name)}&background=F8F9FA&color=1E3D51&size=256`} 
                    alt={`Foto de perfil de ${prof.name}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                  />
                  {/*prof.verified && (
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm border border-gray-100">
                      <CheckCircle2 size={16} className="text-[#B95221]" />
                      <span className="text-xs font-bold text-[#1E3D51] uppercase tracking-wider">Verificado</span>
                    </div>
                */}
                  {prof.reviews_count > 0 && (
                     <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-2 py-1.5 rounded-lg flex items-center gap-1 shadow-sm border border-gray-100">
                      <Star size={14} className="fill-[#B95221] text-[#B95221]" />
                      <span className="text-sm font-bold text-gray-900">{prof.rating}</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col flex-1">
                  <h3 className="font-bold text-[#1E3D51] text-xl leading-tight line-clamp-1 pr-2">{prof.name}</h3>
                  <p className="text-[#B95221] font-semibold text-sm mb-3 line-clamp-2 leading-snug">{prof.title}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>


      
      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
        onSuccess={handleRegisterSuccess} 
      />
      
      <InstallPrompt />
    </div>
  );
}

function App() {
  return (
    <Suspense fallback={
      <div 
        className="min-h-screen flex items-center justify-center bg-[#F8F9FA]"
        role="status" 
        aria-label="Cargando aplicación..."
      >
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#B95221]"></div>
      </div>
    }>
      <Routes>
        <Route path="/" element={<Directorio />} />
        <Route path="/perfil/:slug" element={<Perfil />} />
        <Route path="/crear-negocio" element={<CrearNegocio />} />
        <Route path="/mis-negocios" element={<MisNegocios />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </Suspense>
  );
}

export default App;