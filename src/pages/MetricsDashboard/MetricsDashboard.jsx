// Archivo: src/pages/MetricsDashboard/MetricsDashboard.jsx
import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, BarChart2, Calendar, TrendingUp, Users, MousePointerClick, Filter } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import Header from '../../components/Header';
import BottomNavbar from '../../components/BottomNavbar';
import fetchAuth from '../../utils/fetchAuth';

export default function MetricsDashboard() {
  const { slug } = useParams();
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('spingamma_user') !== null);
  const [isAdmin, setIsAdmin] = useState(() => {
    const stored = localStorage.getItem('spingamma_user');
    if (stored) {
      try { 
        const parsed = JSON.parse(stored);
        return parsed.is_admin === true || parsed.is_vendedor === true; 
      } catch(e) { return false; }
    }
    return false;
  });

  const handleLogout = () => {
    localStorage.removeItem('spingamma_user');
    localStorage.removeItem('spingamma_token');
    setIsLoggedIn(false);
    navigate('/');
  };

  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filtros
  const [timeFilter, setTimeFilter] = useState('general');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
        const res = await fetchAuth(`${API_URL}/businesses/${slug}/metrics`);
        if (res.ok) {
          const data = await res.json();
          setMetrics(data);
        }
      } catch (err) {
        console.error("Error al cargar métricas:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, [slug]);

  // Procesar interacciones según el filtro seleccionado
  const data = useMemo(() => {
    if (!metrics) return [];

    let start = new Date();
    let end = new Date();
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    if (timeFilter === 'general') {
      if (metrics.length === 0) {
        start.setDate(end.getDate() - 7);
      } else {
        const earliest = metrics.reduce((min, m) => {
          if (!m.date) return min;
          const d = new Date(m.date.substring(0, 10) + "T00:00:00");
          return d < min ? d : min;
        }, new Date());
        start = new Date(earliest);
        start.setHours(0, 0, 0, 0);
      }
    } else if (timeFilter === '1_month') {
      start.setMonth(end.getMonth() - 1);
    } else if (timeFilter === '3_months') {
      start.setMonth(end.getMonth() - 3);
    } else if (timeFilter === '6_months') {
      start.setMonth(end.getMonth() - 6);
    } else if (timeFilter === 'custom') {
      if (customStart) start = new Date(customStart + "T00:00:00");
      if (customEnd) end = new Date(customEnd + "T23:59:59");
    }

    let result = [];
    let current = new Date(start);
    
    if (end < start) end = new Date(start);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const maxDays = Math.min(diffDays, 1095); // Max 3 years aprox

    // Preparar el array con todos los días en 0
    for (let i = 0; i <= maxDays; i++) {
      const formattedDate = current.toISOString().split('T')[0];
      const formatOptions = { month: 'short', day: 'numeric' };
      if (maxDays > 90) formatOptions.year = '2-digit';
      
      result.push({
        date: formattedDate,
        name: current.toLocaleDateString('es-ES', formatOptions),
        vistas: 0,
        clics: 0,
      });
      current.setDate(current.getDate() + 1);
    }
    
    // Poblar con métricas reales
    metrics.forEach(interaction => {
      const iDate = interaction.date ? interaction.date.substring(0, 10) : null;
      if (iDate) {
        const dayEntry = result.find(r => r.date === iDate);
        if (dayEntry) {
          if (interaction.platform === 'perfil_view' || interaction.platform === 'Visita Perfil') {
            dayEntry.vistas += 1;
          } else {
            dayEntry.clics += 1;
          }
        }
      }
    });

    return result;
  }, [metrics, timeFilter, customStart, customEnd]);

  // Totales dinámicos según el rango filtrado
  const totalVistas = useMemo(() => data.reduce((sum, item) => sum + item.vistas, 0), [data]);
  const totalClics = useMemo(() => data.reduce((sum, item) => sum + item.clics, 0), [data]);

  // Custom Tooltip premium
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1E3D51]/95 backdrop-blur-md border border-white/20 p-4 rounded-xl shadow-xl text-white">
          <p className="font-bold text-lg mb-2 border-b border-white/10 pb-1">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-2 text-sm my-1">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="font-medium">{entry.name}:</span>
              <span className="font-bold ml-auto">{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans pb-20">
      <Header 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        isLoggedIn={isLoggedIn}
        isAdmin={isAdmin}
        userName={JSON.parse(localStorage.getItem('spingamma_user') || '{}').nombre || ''}
        isUserMenuOpen={isUserMenuOpen}
        setIsUserMenuOpen={setIsUserMenuOpen}
        handleLogout={handleLogout}
        setAuthModalOpen={() => navigate('/')}
        onHomeClick={() => navigate('/')}
        isMobile={window.innerWidth < 768}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative">
        <button onClick={() => navigate('/mis-negocios')} className="flex items-center text-[#32698F] hover:text-[#1D565D] font-medium mb-6 transition-colors group">
          <ArrowLeft size={20} className="mr-2 group-hover:-translate-x-1 transition-transform" /> Volver a Mis Negocios
        </button>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h1 className="text-3xl font-extrabold text-[#1E3D51] flex items-center gap-3">
            <BarChart2 className="text-[#F67927]" size={32} /> Rendimiento de la Tarjeta
          </h1>
          
          {/* Controles de Filtro */}
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="bg-white px-4 py-2.5 rounded-xl shadow-sm border border-gray-200 flex items-center gap-2 focus-within:ring-2 focus-within:ring-[#1E3D51]/20 transition-all">
              <Calendar size={18} className="text-[#1E3D51]" />
              <select 
                value={timeFilter} 
                onChange={(e) => setTimeFilter(e.target.value)}
                className="bg-transparent text-[#1E3D51] font-semibold outline-none cursor-pointer flex-1 text-sm"
              >
                <option value="general">General (Todos los tiempos)</option>
                <option value="1_month">Último mes</option>
                <option value="3_months">Últimos 3 meses</option>
                <option value="6_months">Últimos 6 meses</option>
                <option value="custom">Rango de fechas</option>
              </select>
            </div>
            
            {timeFilter === 'custom' && (
              <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl shadow-sm border border-gray-200 animate-fade-in">
                <input 
                  type="date" 
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="bg-transparent text-sm text-[#1E3D51] font-medium outline-none w-full"
                />
                <span className="text-gray-300 font-bold">-</span>
                <input 
                  type="date" 
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="bg-transparent text-sm text-[#1E3D51] font-medium outline-none w-full"
                />
              </div>
            )}
          </div>
        </div>

        {/* Tarjetas de Resumen Visual */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 flex items-center justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#1E3D51]"></div>
            <div>
              <p className="text-gray-500 font-bold mb-1 text-xs uppercase tracking-widest">Aperturas de Tarjeta</p>
              <h3 className="text-4xl font-extrabold text-[#1E3D51] tracking-tight">{totalVistas}</h3>
            </div>
            <div className="bg-[#1E3D51]/5 p-4 rounded-xl">
              <Users size={32} className="text-[#1E3D51]" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 flex items-center justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#F67927]"></div>
            <div>
              <p className="text-gray-500 font-bold mb-1 text-xs uppercase tracking-widest">Interacciones (Clics)</p>
              <h3 className="text-4xl font-extrabold text-[#F67927] tracking-tight">{totalClics}</h3>
            </div>
            <div className="bg-[#F67927]/5 p-4 rounded-xl">
              <MousePointerClick size={32} className="text-[#F67927]" />
            </div>
          </div>
        </div>

        {/* Contenedor de la Gráfica */}
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="bg-[#1E3D51]/5 p-3 rounded-xl border border-[#1E3D51]/10">
                <TrendingUp size={24} className="text-[#1E3D51]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#1E3D51] tracking-tight">Evolución de Tráfico</h2>
                <p className="text-sm text-gray-500 font-medium mt-0.5">Métricas de impacto generadas por tu tarjeta</p>
              </div>
            </div>
          </div>
          
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorVistas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1E3D51" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#1E3D51" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorClics" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F67927" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#F67927" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#6B7280', fontSize: 13, fontWeight: 500 }}
                  dy={10}
                  minTickGap={30}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#6B7280', fontSize: 13, fontWeight: 500 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="top" 
                  height={36} 
                  iconType="circle"
                  wrapperStyle={{ paddingBottom: '20px', fontWeight: 'bold' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="vistas" 
                  name="Aperturas de Tarjeta" 
                  stroke="#1E3D51" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorVistas)" 
                  activeDot={{ r: 6, fill: "#1E3D51", stroke: "#fff", strokeWidth: 3 }}
                />
                <Area 
                  type="monotone" 
                  dataKey="clics" 
                  name="Clics en Redes/Contacto" 
                  stroke="#F67927" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorClics)" 
                  activeDot={{ r: 6, fill: "#F67927", stroke: "#fff", strokeWidth: 3 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      <BottomNavbar 
        isLoggedIn={isLoggedIn} 
        isAdmin={isAdmin} 
        onHomeClick={() => navigate('/')} 
      />
    </div>
  );
}
