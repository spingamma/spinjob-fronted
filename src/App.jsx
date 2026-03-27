import { useState, useEffect, useMemo } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { 
  Search, Briefcase, Scale, Stethoscope, Calculator, 
  PenTool, Laptop, MapPin, CheckCircle2, LayoutGrid, Home, Brain, UserPlus, X, Star, LogOut,
  ChevronDown, ChevronRight, LayoutList
} from 'lucide-react';
import Perfil from './Perfil';
import AuthModal from './components/AuthModal';

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
  const navigate = useNavigate();

  const [activeCategory, setActiveCategory] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');

  // Estados de modales y UI
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  // Estados de autenticación
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('spingamma_user') !== null);
  const [userName, setUserName] = useState(() => {
    const stored = localStorage.getItem('spingamma_user');
    if (stored) {
      try { return JSON.parse(stored).nombre; } catch(e) { return ''; }
    }
    return '';
  });
  
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [pendingSlug, setPendingSlug] = useState(null);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/profesionales`)
      .then(res => res.json())
      .then(data => { 
        setProfesionales(data); 
        setCargando(false); 
      })
      .catch(err => {
        console.error("Error al cargar profesionales:", err);
        setCargando(false);
      });
  }, []);

  // 🚀 Categorías dinámicas obtenidas directamente de la BD
  const dynamicCategories = useMemo(() => {
    const categoriesFromDB = profesionales.map(p => p.category).filter(Boolean);
    const uniqueCategories = [...new Set(categoriesFromDB)].sort();
    return uniqueCategories;
  }, [profesionales]);

  // Construir array completo para la barra superior
  const topBarCategories = ['Todos', ...dynamicCategories];

  const filteredProfessionals = profesionales
    .filter(p => {
      const matchCategory = activeCategory === 'Todos' || p.category === activeCategory;
      const searchNormalized = normalizeText(searchTerm);
      const matchSearch = normalizeText(p.name).includes(searchNormalized) || 
                          normalizeText(p.title).includes(searchNormalized);
      return matchCategory && matchSearch;
    })
    .sort((a, b) => (b.rating || 0) - (a.rating || 0));

  const handleCardClick = (slug) => {
    if (isLoggedIn) {
      navigate(`/perfil/${slug}`);
    } else {
      setPendingSlug(slug);
      setAuthModalOpen(true);
    }
  };

  const handleRegisterSuccess = (formData) => {
    localStorage.setItem('spingamma_user', JSON.stringify(formData));
    setIsLoggedIn(true);
    setUserName(formData.nombre);
    setAuthModalOpen(false);
    if (pendingSlug) {
      navigate(`/perfil/${pendingSlug}`);
      setPendingSlug(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('spingamma_user');
    setIsLoggedIn(false);
    setUserName('');
  };

  const seleccionarCategoriaDesdeModal = (cat) => {
    setActiveCategory(cat);
    setIsCategoryModalOpen(false);
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
            <span className="font-extrabold text-xl lg:text-2xl tracking-tight text-[#1E3D51] uppercase hidden md:block ml-3">SPINGAMMA</span>
          </div>
          
          <div className="flex-1 max-w-2xl">
            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-full shadow-inner py-1.5 px-2.5 focus-within:ring-2 focus-within:ring-[#B95221] transition-all">
              <Search size={16} className="text-[#32698F] mr-1.5 sm:mr-2 flex-shrink-0" />
              <input 
                type="text" 
                placeholder="Buscar profesional..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                className="w-full bg-transparent text-[#1E3D51] placeholder-gray-400 outline-none text-[13px] sm:text-base" 
              />
            </div>
          </div>

          <div className="flex items-center flex-shrink-0">
            {isLoggedIn ? (
              <div className="flex items-center gap-1.5 sm:gap-2 bg-white border border-gray-200 py-1 sm:py-1.5 px-1.5 sm:px-3 rounded-full shadow-sm">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#B95221] flex items-center justify-center shadow-inner flex-shrink-0">
                  <span className="text-white font-bold text-xs sm:text-sm">
                    {userName ? userName.charAt(0).toUpperCase() : 'U'}
                  </span>
                </div>
                <span className="text-sm text-gray-600 hidden lg:block mr-1 truncate max-w-[100px]">
                  Hola, <strong className="text-[#1E3D51] font-semibold">{userName.split(' ')[0]}</strong>
                </span>
                <div className="w-[1px] h-4 bg-gray-200 hidden md:block mx-1"></div>
                <button 
                  onClick={handleLogout} 
                  className="flex items-center justify-center text-gray-500 hover:text-[#B95221] transition-colors p-1"
                  title="Cerrar sesión"
                >
                  <LogOut size={18} />
                  <span className="hidden md:block ml-1.5 text-sm">Salir</span>
                </button>
              </div>
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

      {/* BARRA DE CATEGORÍAS UX OPTIMIZADA */}
      <div className="bg-white shadow-sm sticky top-16 md:top-20 z-30 pt-4 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between pb-1">
            
            {/* Scroll de solo 3 o 4 elementos rápidos */}
            <div className="flex space-x-5 overflow-x-auto scrollbar-hide flex-1">
              {topBarCategories.slice(0, 4).map((cat) => {
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

            {/* BOTÓN EXPLORAR (Siempre visible a la derecha) */}
            <button 
              onClick={() => setIsCategoryModalOpen(true)}
              className="flex flex-col items-center gap-1.5 pb-2 ml-4 flex-shrink-0 group border-l border-gray-200 pl-4"
            >
              <div className="text-[#B95221] group-hover:scale-110 transition-transform bg-[#B95221]/10 p-1.5 rounded-lg"><LayoutList size={20} /></div>
              <span className="text-[0.75rem] font-bold text-[#B95221]">Más</span>
            </button>

          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {cargando ? (
          <div className="text-center py-20 flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#B95221] mb-4"></div>
            <p className="text-gray-500 font-medium text-lg">Cargando directorio SPINGAMMA...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProfessionals.map((prof) => (
              <div key={prof.id} onClick={() => handleCardClick(prof.slug)} className="group cursor-pointer flex flex-col h-full bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-4 transform hover:-translate-y-1 border border-gray-100 hover:border-[#B95221]/30">
                <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-50 mb-4">
                  <img src={prof.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(prof.name)}&background=F8F9FA&color=1E3D51&size=256`} onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(prof.name)}&background=F8F9FA&color=1E3D51&size=256`; }} alt={prof.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  
                  {prof.verified && (
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm border border-gray-100">
                      <CheckCircle2 size={16} className="text-[#B95221]" />
                      <span className="text-xs font-bold text-[#1E3D51] uppercase tracking-wider">Verificado</span>
                    </div>
                  )}

                  {prof.reviews_count > 0 && (
                     <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-2 py-1.5 rounded-lg flex items-center gap-1 shadow-sm border border-gray-100">
                      <Star size={14} className="fill-[#B95221] text-[#B95221]" />
                      <span className="text-sm font-bold text-gray-900">{prof.rating}</span>
                      <span className="text-[0.65rem] font-bold text-gray-400 ml-0.5">({prof.reviews_count})</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-[#1E3D51] text-xl leading-tight line-clamp-1 pr-2">{prof.name}</h3>
                    {prof.reviews_count === 0 && (
                      <span className="text-[0.65rem] font-bold bg-[#B95221]/10 text-[#B95221] px-2 py-0.5 rounded-full border border-[#B95221]/20">Nuevo</span>
                    )}
                  </div>
                  
                  <p className="text-[#B95221] font-semibold text-sm mb-3 line-clamp-2 leading-snug">{prof.title}</p>
                  <div className="mt-auto pt-3 border-t border-gray-100">
                    {prof.location && (
                      <div className="flex items-center text-gray-500 text-sm mb-2">
                        <MapPin size={16} className="mr-1.5 flex-shrink-0 text-[#B95221]" />
                        <span className="truncate">{prof.location}</span>
                      </div>
                    )}
                    <p className="text-gray-600 text-sm line-clamp-2">{prof.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* =========================================
          BOTTOM SHEET DE CATEGORÍAS (DINÁMICO)
          ========================================= */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#1E3D51]/50 backdrop-blur-sm transition-opacity">
          {/* Capa de clic para cerrar */}
          <div className="absolute inset-0" onClick={() => setIsCategoryModalOpen(false)}></div>
          
          {/* Contenedor del panel */}
          <div className="bg-white w-full sm:w-[450px] sm:rounded-3xl rounded-t-3xl max-h-[85vh] flex flex-col shadow-2xl relative animate-in slide-in-from-bottom-10 sm:zoom-in duration-300">
            
            {/* Cabecera del Panel */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-xl font-extrabold text-[#1E3D51] flex items-center gap-2">
                <LayoutList className="text-[#B95221]" /> Explorar Categorías
              </h2>
              <button onClick={() => setIsCategoryModalOpen(false)} className="text-gray-400 hover:text-[#1E3D51] bg-gray-100 p-1.5 rounded-full transition-colors hover:bg-gray-200">
                <X size={20} />
              </button>
            </div>

            {/* Lista Vertical Dinámica desde la DB */}
            <div className="p-4 overflow-y-auto flex-1 space-y-3">
              
              <button 
                onClick={() => seleccionarCategoriaDesdeModal('Todos')}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all ${activeCategory === 'Todos' ? 'bg-orange-50 border-[#B95221] shadow-sm' : 'bg-white border-gray-100 hover:border-[#32698F]/30 hover:bg-gray-50'}`}
              >
                <div className={`${activeCategory === 'Todos' ? 'text-[#B95221]' : 'text-[#32698F]'}`}><LayoutGrid size={24} /></div>
                <span className={`text-lg font-bold ${activeCategory === 'Todos' ? 'text-[#B95221]' : 'text-[#1E3D51]'}`}>Todos los Profesionales</span>
              </button>

              {dynamicCategories.map((cat, idx) => {
                const isActive = activeCategory === cat;
                return (
                  <button 
                    key={idx}
                    onClick={() => seleccionarCategoriaDesdeModal(cat)}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all ${isActive ? 'bg-orange-50 border-[#B95221] shadow-sm' : 'bg-white border-gray-100 hover:border-[#32698F]/30 hover:bg-gray-50'}`}
                  >
                    <div className={`${isActive ? 'text-[#B95221]' : 'text-[#32698F]'}`}>{getCategoryIcon(cat)}</div>
                    <span className={`text-lg font-bold text-left ${isActive ? 'text-[#B95221]' : 'text-[#1E3D51]'}`}>{cat}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE REGISTRO REUTILIZABLE */}
      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
        onSuccess={handleRegisterSuccess} 
        isDarkTheme={false} 
      />
      
      {/* FOOTER */}
      <footer className="mt-20 bg-white border-t border-gray-200 py-8 text-center flex flex-col items-center justify-center">
        <a 
          href="https://spingamma.github.io/spingamma-landing/" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="group flex flex-col items-center gap-1 opacity-80 hover:opacity-100 transition-opacity"
        >
          <span className="text-xs text-gray-400 font-medium">Potenciado por</span>
          <span className="font-extrabold tracking-wider text-[#1E3D51] group-hover:text-[#B95221] transition-colors">SPINGAMMA</span>
        </a>
        <p className="text-xs text-gray-400 mt-3">© {new Date().getFullYear()} Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Directorio />} />
      <Route path="/perfil/:slug" element={<Perfil />} />
    </Routes>
  );
}

export default App;