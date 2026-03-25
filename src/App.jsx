// src/App.jsx
import { useState, useEffect, useMemo } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { 
  Search, Briefcase, Scale, Stethoscope, Calculator, 
  PenTool, Laptop, MapPin, CheckCircle2, LayoutGrid, Home, Brain, UserPlus, X, Star
} from 'lucide-react';
import Perfil from './Perfil';

const normalizeText = (text) => {
  if (!text) return '';
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
};

const getCategoryIcon = (categoryName) => {
  const name = normalizeText(categoryName);
  if (name.includes('abogado') || name.includes('legal')) return <Scale size={26} />;
  if (name.includes('medic') || name.includes('salud')) return <Stethoscope size={26} />;
  if (name.includes('conta') || name.includes('finanz')) return <Calculator size={26} />;
  if (name.includes('diseñ') || name.includes('arte')) return <PenTool size={26} />;
  if (name.includes('tecno') || name.includes('sistem')) return <Laptop size={26} />;
  if (name.includes('inmo') || name.includes('casa') || name.includes('prop')) return <Home size={26} />;
  if (name.includes('psico') || name.includes('mente') || name.includes('terapia')) return <Brain size={26} />;
  if (name === 'todos') return <LayoutGrid size={26} />;
  return <Briefcase size={26} />; 
};

function Directorio() {
  const [profesionales, setProfesionales] = useState([]);
  const [cargando, setCargando] = useState(true);
  const navigate = useNavigate();

  const [activeCategory, setActiveCategory] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');

  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('spingamma_user') !== null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [pendingSlug, setPendingSlug] = useState(null);
  const [formData, setFormData] = useState({ nombre: '', celular: '' });

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/profesionales/`)
      .then(res => res.json())
      .then(data => { 
        setProfesionales(data); 
        setCargando(false); 
      })
      .catch(err => console.error("Error al cargar profesionales:", err));
  }, []);

  const dynamicCategories = useMemo(() => {
    const categoriesFromDB = profesionales.map(p => p.category).filter(Boolean);
    const uniqueCategories = [...new Set(categoriesFromDB)];
    return ['Todos', ...uniqueCategories];
  }, [profesionales]);

  // Motor de Búsqueda Dinámico + ORDENAMIENTO POR ESTRELLAS (Punto 5d)
  const filteredProfessionals = profesionales
    .filter(p => {
      const matchCategory = activeCategory === 'Todos' || p.category === activeCategory;
      const searchNormalized = normalizeText(searchTerm);
      const matchSearch = normalizeText(p.name).includes(searchNormalized) || 
                          normalizeText(p.title).includes(searchNormalized);
      return matchCategory && matchSearch;
    })
    .sort((a, b) => (b.rating || 0) - (a.rating || 0)); // Ordena de mayor a menor rating

  const handleCardClick = (slug) => {
    if (isLoggedIn) {
      navigate(`/perfil/${slug}`);
    } else {
      setPendingSlug(slug);
      setAuthModalOpen(true);
    }
  };

  const handleRegister = (e) => {
    e.preventDefault();
    if (formData.nombre.trim() && formData.celular.trim()) {
      localStorage.setItem('spingamma_user', JSON.stringify(formData));
      setIsLoggedIn(true);
      setAuthModalOpen(false);
      if (pendingSlug) {
        navigate(`/perfil/${pendingSlug}`);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#1E3D51] text-white font-sans pb-12 antialiased selection:bg-[#F67927] selection:text-white relative">
      <header className="sticky top-0 z-40 bg-[#152a38] border-b border-[#32698F]/30 shadow-md py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-10 h-10 bg-[#F67927] rounded-xl flex items-center justify-center mr-3 shadow-lg">
              <Briefcase className="text-white" size={24} />
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-white uppercase">SPINGAMMA</span>
          </div>
          <div className="w-full max-w-lg">
            <div className="flex items-center bg-[#32698F] border border-[#32698F] rounded-full shadow-inner py-1.5 px-2 focus-within:ring-2 focus-within:ring-[#F67927] transition-all">
              <div className="pl-3 pr-2 text-[#E6E2DF]"><Search size={20} /></div>
              <input type="text" placeholder="Buscar por nombre o profesión..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-transparent text-white placeholder-[#E6E2DF]/70 outline-none py-2 text-sm md:text-base" />
            </div>
          </div>
        </div>
      </header>

      <div className="bg-[#1E3D51] shadow-sm sticky top-[76px] md:top-[88px] z-30 pt-4 border-b border-[#32698F]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-6 overflow-x-auto pb-1 scrollbar-hide">
            {dynamicCategories.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button key={cat} onClick={() => setActiveCategory(cat)} className="flex flex-col items-center min-w-max gap-2 pb-3 relative group">
                  <div className={`transition-colors duration-300 ${isActive ? 'text-[#F67927]' : 'text-[#E6E2DF] group-hover:text-white'}`}>{getCategoryIcon(cat)}</div>
                  <span className={`text-sm font-medium transition-colors duration-300 ${isActive ? 'text-white font-bold' : 'text-[#E6E2DF] group-hover:text-white'}`}>{cat}</span>
                  {isActive && <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#F67927] rounded-t-md"></div>}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {cargando ? (
          <div className="text-center py-20 flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#F67927] mb-4"></div>
            <p className="text-[#E6E2DF] font-medium text-lg">Cargando directorio SPINGAMMA...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProfessionals.map((prof) => (
              <div key={prof.id} onClick={() => handleCardClick(prof.slug)} className="group cursor-pointer flex flex-col h-full bg-[#32698F] rounded-2xl shadow-lg hover:shadow-2xl hover:shadow-[#152a38] transition-all duration-300 p-4 transform hover:-translate-y-1 border border-[#32698F] hover:border-[#F67927]/50">
                
                <div className="relative aspect-square overflow-hidden rounded-xl bg-[#1E3D51] mb-4">
                  <img src={prof.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(prof.name)}&background=1E3D51&color=FFFFFF&size=256`} onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(prof.name)}&background=1E3D51&color=FFFFFF&size=256`; }} alt={prof.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  
                  {prof.verified && (
                    <div className="absolute top-3 left-3 bg-[#1E3D51]/90 backdrop-blur-sm px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 shadow-md border border-[#F67927]/30">
                      <CheckCircle2 size={16} className="text-[#F67927]" />
                      <span className="text-xs font-bold text-white uppercase tracking-wider">Verificado</span>
                    </div>
                  )}

                  {/* NUEVO: Etiqueta de Estrellas Flotante */}
                  {prof.reviews_count > 0 && (
                    <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-2 py-1.5 rounded-lg flex items-center gap-1 shadow-md">
                      <Star size={14} className="fill-[#F67927] text-[#F67927]" />
                      <span className="text-sm font-bold text-gray-900">{prof.rating}</span>
                      <span className="text-[0.65rem] font-bold text-gray-400 ml-0.5">({prof.reviews_count})</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-white text-xl leading-tight line-clamp-1 pr-2">{prof.name}</h3>
                    {/* Si no tiene reseñas, mostramos "Nuevo" */}
                    {prof.reviews_count === 0 && (
                      <span className="text-[0.65rem] font-bold bg-[#F67927]/20 text-[#F67927] px-2 py-0.5 rounded-full border border-[#F67927]/30">Nuevo</span>
                    )}
                  </div>
                  
                  <p className="text-[#F67927] font-semibold text-sm mb-3 line-clamp-2 leading-snug">{prof.title}</p>
                  <div className="mt-auto pt-3 border-t border-[#1E3D51]">
                    {prof.location && (
                      <div className="flex items-center text-[#E6E2DF] text-sm mb-2">
                        <MapPin size={16} className="mr-1.5 flex-shrink-0 text-[#F67927]" />
                        <span className="truncate">{prof.location}</span>
                      </div>
                    )}
                    <p className="text-[#E6E2DF]/80 text-sm line-clamp-2">{prof.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {authModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#152a38]/80 backdrop-blur-sm transition-opacity">
          <div className="bg-[#1E3D51] border border-[#32698F] rounded-3xl shadow-2xl max-w-md w-full p-8 relative animate-in fade-in zoom-in duration-300">
            <button onClick={() => setAuthModalOpen(false)} className="absolute top-5 right-5 text-[#E6E2DF] hover:text-white transition-colors p-2 bg-[#32698F] rounded-full hover:bg-[#F67927]"><X size={20} /></button>
            <div className="text-center mb-6 mt-2">
              <div className="w-20 h-20 bg-[#32698F] rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-[#F67927] shadow-inner"><UserPlus size={36} className="text-[#F67927]" /></div>
              <h2 className="text-2xl font-extrabold text-white mb-2">Comunidad Segura</h2>
              <p className="text-[#E6E2DF] text-sm px-2">Para ver perfiles y garantizar valoraciones reales, regístrate gratis en 10 segundos.</p>
            </div>
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#F67927] uppercase tracking-wide mb-1">Nombre Completo</label>
                <input required type="text" placeholder="Ej. Ana Pérez" value={formData.nombre} onChange={(e) => setFormData({...formData, nombre: e.target.value})} className="w-full bg-[#32698F] border border-[#32698F] text-white px-4 py-3 rounded-xl outline-none focus:border-[#F67927] focus:ring-1 focus:ring-[#F67927] placeholder-[#E6E2DF]/50 transition-all"/>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#F67927] uppercase tracking-wide mb-1">Celular / WhatsApp</label>
                <input required type="tel" placeholder="Ej. 71234567" value={formData.celular} onChange={(e) => setFormData({...formData, celular: e.target.value})} className="w-full bg-[#32698F] border border-[#32698F] text-white px-4 py-3 rounded-xl outline-none focus:border-[#F67927] focus:ring-1 focus:ring-[#F67927] placeholder-[#E6E2DF]/50 transition-all"/>
              </div>
              <button type="submit" className="w-full bg-[#F67927] hover:bg-[#e06516] text-white font-bold py-4 px-4 rounded-xl transition-all shadow-lg hover:-translate-y-0.5 mt-4">Ver Profesional</button>
            </form>
          </div>
        </div>
      )}
      <footer className="mt-20 bg-[#152a38] border-t border-[#32698F]/30 py-8 text-center text-sm text-[#E6E2DF]"><p className="font-bold mb-1 tracking-wider">SPINGAMMA</p><p className="text-[#E6E2DF]/70">© 2026 Todos los derechos reservados.</p></footer>
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