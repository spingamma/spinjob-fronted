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
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  // Filtros Avanzados
  const [activeLocation, setActiveLocation] = useState('Todas');
  const [activeRating, setActiveRating] = useState('Todos');

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
        const res = await fetch(`${API_URL}/profesionales/`);
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

  const dynamicCategories = useMemo(() => {
    const categoriesFromDB = profesionales.map(p => p.category).filter(Boolean);
    const uniqueCategories = [...new Set(categoriesFromDB)].sort();
    return uniqueCategories;
  }, [profesionales]);

  const topBarCategories = ['Todos', ...dynamicCategories];

  const uniqueLocations = useMemo(() => {
    const locationsFromDB = profesionales.map(p => p.location).filter(Boolean);
    const unique = [...new Set(locationsFromDB)].sort();
    return ['Todas', ...unique];
  }, [profesionales]);

  const carouselRef = useRef(null);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollButtons = useCallback(() => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(updateScrollButtons, 100);
    window.addEventListener('resize', updateScrollButtons);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateScrollButtons);
    };
  }, [updateScrollButtons, dynamicCategories]);

  const filteredProfessionals = profesionales
    .filter(p => {
      const matchCategory = activeCategory === 'Todos' || p.category === activeCategory;
      const searchNormalized = normalizeText(searchTerm);
      const matchSearch = normalizeText(p.name).includes(searchNormalized) || 
                          normalizeText(p.title).includes(searchNormalized);
      const matchLocation = activeLocation === 'Todas' || p.location === activeLocation;
      
      let matchRating = true;
      if (activeRating === '5 Estrellas') matchRating = (p.rating || 0) >= 5;
      else if (activeRating === '4+ Estrellas') matchRating = (p.rating || 0) >= 4;
      else if (activeRating === '3+ Estrellas') matchRating = (p.rating || 0) >= 3;

      return matchCategory && matchSearch && matchLocation && matchRating;
    })
    .sort((a, b) => (b.rating || 0) - (a.rating || 0));

  const handleLogout = () => {
    localStorage.removeItem('spingamma_user');
    setIsLoggedIn(false);
    setUserName('');
    setIsAdmin(false);
  };

  const seleccionarCategoriaDesdeModal = (cat) => {
    setActiveCategory(cat);
    setIsCategoryModalOpen(false);
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

      {/* BARRA DE CATEGORÍAS */}
      <div className="bg-white shadow-sm sticky top-16 md:top-20 z-30 pt-4 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between pb-1 relative">
            
            <button 
              onClick={() => setActiveCategory('Todos')} 
              className="flex flex-col items-center gap-1.5 pb-2 pr-2 sm:pr-4 border-r border-gray-200 flex-shrink-0 group relative"
            >
              <div className={`transition-colors duration-300 ${activeCategory === 'Todos' ? 'text-[#B95221]' : 'text-[#32698F] group-hover:text-[#1E3D51]'}`}>{getCategoryIcon('Todos')}</div>
              <span className={`text-[0.8rem] font-medium transition-colors duration-300 ${activeCategory === 'Todos' ? 'text-[#1E3D51] font-bold' : 'text-gray-500 group-hover:text-[#1E3D51]'}`}>Todos</span>
              {activeCategory === 'Todos' && <div className="absolute bottom-0 left-0 right-2 sm:right-4 h-[3px] bg-[#B95221] rounded-t-md"></div>}
            </button>

            <button 
              onClick={() => carouselRef.current?.scrollBy({ left: -150, behavior: 'smooth' })}
              disabled={!canScrollLeft}
              className={`md:hidden flex items-center justify-center p-1 rounded-full z-10 bg-white border border-gray-100 mx-1 flex-shrink-0 transition-all duration-300
                ${canScrollLeft ? 'text-[#B95221] hover:bg-gray-50 shadow-[0_0_8px_rgba(0,0,0,0.1)] cursor-pointer hover:scale-105' : 'text-gray-300 opacity-40 cursor-not-allowed shadow-none'}
              `}
            >
              <ChevronLeft size={16} />
            </button>

            <div 
              ref={carouselRef} 
              onScroll={updateScrollButtons}
              className="flex space-x-5 overflow-x-auto scrollbar-hide flex-1 px-2 sm:px-4 scroll-smooth"
            >
              {dynamicCategories.map((cat) => {
                const isActive = activeCategory === cat;
                return (
                  <button key={cat} onClick={() => setActiveCategory(cat)} className="flex flex-col items-center min-w-max gap-1.5 pb-2 relative group">
                    <div className={`transition-colors duration-300 ${isActive ? 'text-[#B95221]' : 'text-[#32698F] group-hover:text-[#1E3D51]'}`}>{getCategoryIcon(cat)}</div>
                    <span className={`text-[0.8rem] font-medium transition-colors duration-300 ${isActive ? 'text-[#1E3D51] font-bold' : 'text-gray-500 group-hover:text-[#1E3D51]'}`}>{cat}</span>
                    {isActive && <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#B95221] rounded-t-md"></div>}
                  </button>
                );
              })}
            </div>

            <button 
              onClick={() => carouselRef.current?.scrollBy({ left: 150, behavior: 'smooth' })}
              disabled={!canScrollRight}
              className={`md:hidden flex items-center justify-center p-1 rounded-full z-10 bg-white border border-gray-100 mx-1 flex-shrink-0 transition-all duration-300
                ${canScrollRight ? 'text-[#B95221] hover:bg-gray-50 shadow-[0_0_8px_rgba(0,0,0,0.1)] cursor-pointer hover:scale-105' : 'text-gray-300 opacity-40 cursor-not-allowed shadow-none'}
              `}
            >
              <ChevronRight size={16} />
            </button>

            <button 
              onClick={() => setIsCategoryModalOpen(true)}
              className="flex flex-col items-center gap-1.5 pb-2 flex-shrink-0 group border-l border-gray-200 pl-2 sm:pl-4 relative"
            >
              <div className="text-[#B95221] group-hover:scale-110 transition-transform bg-[#B95221]/10 p-1.5 rounded-lg"><LayoutList size={20} /></div>
              <span className="text-[0.75rem] font-bold text-[#B95221]">Menu</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 flex flex-wrap items-center justify-end gap-3">
        <div className="flex items-center bg-white border border-gray-200 rounded-xl px-3 py-1.5 shadow-sm focus-within:border-[#B95221] focus-within:ring-1 focus-within:ring-[#B95221] transition-all">
          <MapPin size={16} className="text-[#32698F] mr-2" />
          <select 
            value={activeLocation}
            onChange={(e) => setActiveLocation(e.target.value)}
            className="bg-transparent text-sm text-[#1E3D51] font-medium outline-none cursor-pointer"
          >
            {uniqueLocations.map(loc => (
              <option key={loc} value={loc}>{loc === 'Todas' ? 'Todas las ciudades' : loc}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center bg-white border border-gray-200 rounded-xl px-3 py-1.5 shadow-sm focus-within:border-[#B95221] focus-within:ring-1 focus-within:ring-[#B95221] transition-all">
          <Star size={16} className="text-[#F67927] mr-2" />
          <select 
            value={activeRating}
            onChange={(e) => setActiveRating(e.target.value)}
            className="bg-transparent text-sm text-[#1E3D51] font-medium outline-none cursor-pointer"
          >
            <option value="Todos">Cualquier calificación</option>
            <option value="5 Estrellas">Solo 5 Estrellas</option>
            <option value="4+ Estrellas">4 o más Estrellas</option>
            <option value="3+ Estrellas">3 o más Estrellas</option>
          </select>
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

      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#1E3D51]/50 backdrop-blur-sm">
          <div className="absolute inset-0" onClick={() => setIsCategoryModalOpen(false)}></div>
          <div className="bg-white w-full sm:w-[450px] sm:rounded-3xl rounded-t-3xl max-h-[85vh] flex flex-col shadow-2xl relative">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-xl font-extrabold text-[#1E3D51] flex items-center gap-2">Explorar Categorías</h2>
              <button 
                onClick={() => setIsCategoryModalOpen(false)} 
                aria-label="Cerrar"
                className="text-gray-400 bg-gray-100 p-1.5 rounded-full"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-1 space-y-3">
              {topBarCategories.map((cat, idx) => (
                <button 
                  key={idx}
                  onClick={() => seleccionarCategoriaDesdeModal(cat)}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl border border-gray-100 hover:bg-gray-50"
                >
                  <div className="text-[#32698F]">{getCategoryIcon(cat)}</div>
                  <span className="text-lg font-bold text-[#1E3D51]">{cat}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      
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