import { useState, useEffect } from 'react';
import { Search, Loader2, BarChart2, Plus, X, Globe, Building, Calendar, Download } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import fetchAuth from '../../../utils/fetchAuth';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function AdminAnalyticsTab({ API_URL }) {
  const [viewMode, setViewMode] = useState('global'); // 'global' o 'compare'
  const [days, setDays] = useState(14); // 7, 14, 30, 'custom'
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  
  const [selectedBusinesses, setSelectedBusinesses] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [networkStats, setNetworkStats] = useState([]);
  const [globalStats, setGlobalStats] = useState({ totalVisitas: 0, totalContactos: 0 });
  const [isLoadingChart, setIsLoadingChart] = useState(false);
  const [isLoadingAll, setIsLoadingAll] = useState(false);

  const COLORS = ['#1A535C', '#F9842C', '#6A431F', '#757778', '#1A535C', '#F9842C', '#6A431F'];

  // Buscador de Negocios (solo para modo compare)
  useEffect(() => {
    if (viewMode !== 'compare') return;
    const delayDebounce = setTimeout(async () => {
      // Si está vacío pero el dropdown está abierto, buscar sin filtro (traer recientes)
      if (searchTerm.trim().length === 0 && !showDropdown) {
        setSearchResults([]);
        return;
      }
      setIsSearching(true);
      try {
        const res = await fetchAuth(`${API_URL}/admin/businesses/search?q=${encodeURIComponent(searchTerm)}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data);
        }
      } catch (err) {
        console.error("Error buscando negocios:", err);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, showDropdown, API_URL, viewMode]);

  const handleAddAllBusinesses = async () => {
    setIsLoadingAll(true);
    try {
      const res = await fetchAuth(`${API_URL}/admin/businesses/search?q=`);
      if (res.ok) {
        const data = await res.json();
        const newSelected = [];
        data.forEach((b, index) => {
          newSelected.push({ ...b, color: COLORS[(index + 2) % COLORS.length] });
        });
        setSelectedBusinesses(newSelected);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingAll(false);
    }
  };

  const handleAddBusiness = (business) => {
    if (selectedBusinesses.some(b => b.slug === business.slug)) return;
    if (selectedBusinesses.length >= 50) {
      alert("Máximo 50 negocios para comparar a la vez.");
      return;
    }
    const color = COLORS[(selectedBusinesses.length + 2) % COLORS.length];
    setSelectedBusinesses([...selectedBusinesses, { ...business, color }]);
    setSearchTerm('');
    setShowDropdown(false);
  };

  const handleRemoveBusiness = (slug) => {
    setSelectedBusinesses(prev => prev.filter(b => b.slug !== slug));
  };

  const isVisit = (platform) => platform === 'perfil_view' || platform === 'Visita Perfil';

  // Lógica de Generación de Gráficas
  useEffect(() => {
    const loadMetrics = async () => {
      // Si es custom y no hay fechas válidas, no cargar o esperar
      if (days === 'custom') {
        if (!customStartDate || !customEndDate) return;
        if (new Date(customStartDate) > new Date(customEndDate)) return;
      }

      setIsLoadingChart(true);
      try {
        // 1. Inicializar estructura de fechas
        const groupedData = {};
        
        if (days === 'custom') {
          const startDateObj = new Date(customStartDate + "T00:00:00");
          const endDateObj = new Date(customEndDate + "T23:59:59");
          const totalDays = Math.ceil((endDateObj - startDateObj) / (1000 * 60 * 60 * 24));
          
          for (let i = 0; i < totalDays; i++) {
            const d = new Date(startDateObj);
            d.setDate(d.getDate() + i);
            const dateStr = d.toISOString().split('T')[0];
            groupedData[dateStr] = {
              date: dateStr,
              displayDate: `${d.getDate()}/${d.getMonth()+1}`
            };
          }
        } else {
          const hoy = new Date();
          for (let i = days - 1; i >= 0; i--) {
            const d = new Date(hoy);
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            groupedData[dateStr] = {
              date: dateStr,
              displayDate: `${d.getDate()}/${d.getMonth()+1}`
            };
          }
        }

        // Parámetros URL
        let queryParams = `days=${days === 'custom' ? 14 : days}`; // default 14 if custom has bug
        if (days === 'custom') {
          queryParams = `start_date=${customStartDate}&end_date=${customEndDate}`;
        }

        if (viewMode === 'global') {
          // ================= MODO GLOBAL =================
          const res = await fetchAuth(`${API_URL}/admin/analytics/global?${queryParams}`);
          if (!res.ok) throw new Error("Error fetching global");
          const data = await res.json();
          
          let sumVisitas = 0;
          let sumContactos = 0;
          let redesCount = {};
          let uniqueUsersGlobal = new Map();

          // Iniciar contadores
          Object.keys(groupedData).forEach(k => {
            groupedData[k]['Visitas'] = 0;
            groupedData[k]['Redes / WhatsApp'] = 0;
          });

          data.forEach(inter => {
            if (inter.user_id && !uniqueUsersGlobal.has(inter.user_id)) {
              uniqueUsersGlobal.set(inter.user_id, { 
                name: inter.user_name || "Anónimo", 
                phone: inter.user_phone || "Sin registro",
                is_owner: inter.is_owner || false
              });
            }
            const dateStr = inter.date.substring(0, 10);
            if (groupedData[dateStr]) {
              if (isVisit(inter.platform)) {
                groupedData[dateStr]['Visitas'] += 1;
                sumVisitas++;
              } else {
                groupedData[dateStr]['Redes / WhatsApp'] += 1;
                sumContactos++;
                redesCount[inter.platform] = (redesCount[inter.platform] || 0) + 1;
              }
            }
          });

          setGlobalStats({ totalVisitas: sumVisitas, totalContactos: sumContactos });
          setChartData(Object.values(groupedData));
          setNetworkStats([{ business: { name: "Toda la Aplicación", color: '#1A535C' }, redes: redesCount, visitas: sumVisitas, users: uniqueUsersGlobal }]);

        } else if (viewMode === 'compare') {
          // ================= MODO COMPARADOR =================
          if (selectedBusinesses.length === 0) {
            setChartData([]);
            setGlobalStats({ totalVisitas: 0, totalContactos: 0 });
            setNetworkStats([]);
            setIsLoadingChart(false);
            return;
          }

          const promises = selectedBusinesses.map(b => 
            fetchAuth(`${API_URL}/admin/businesses/${b.slug}/interacciones?${queryParams}`).then(res => res.json())
          );
          const results = await Promise.all(promises);

          let sumVisitas = 0;
          let sumContactos = 0;
          const newNetworkStats = [];

          if (selectedBusinesses.length === 1) {
            // Un solo negocio: Mostrar Visitas vs WhatsApp de ese negocio
            Object.keys(groupedData).forEach(k => {
              groupedData[k]['Visitas'] = 0;
              groupedData[k]['Redes / WhatsApp'] = 0;
            });
            let redesCount = {};
            let uniqueUsers = new Map();
            let visitasNegocio = 0;

            results[0].forEach(inter => {
              if (inter.user_id && !uniqueUsers.has(inter.user_id)) {
                uniqueUsers.set(inter.user_id, { 
                  name: inter.user_name || "Anónimo", 
                  phone: inter.user_phone || "Sin registro",
                  is_owner: inter.is_owner || false
                });
              }
              const dateStr = inter.date.substring(0, 10);
              if (groupedData[dateStr]) {
                if (isVisit(inter.platform)) {
                  groupedData[dateStr]['Visitas'] += 1;
                  sumVisitas++;
                  visitasNegocio++;
                } else {
                  groupedData[dateStr]['Redes / WhatsApp'] += 1;
                  sumContactos++;
                  redesCount[inter.platform] = (redesCount[inter.platform] || 0) + 1;
                }
              }
            });
            newNetworkStats.push({ business: selectedBusinesses[0], redes: redesCount, visitas: visitasNegocio, users: uniqueUsers });
          } else {
            // Múltiples negocios: Mostrar 1 línea de Total por negocio
            Object.keys(groupedData).forEach(k => {
              selectedBusinesses.forEach(b => { groupedData[k][b.slug] = 0; });
            });
            selectedBusinesses.forEach((b, i) => {
              let redesCount = {};
              let uniqueUsers = new Map();
              let visitasNegocio = 0;

              results[i].forEach(inter => {
                if (inter.user_id && !uniqueUsers.has(inter.user_id)) {
                  uniqueUsers.set(inter.user_id, { 
                    name: inter.user_name || "Anónimo", 
                    phone: inter.user_phone || "Sin registro",
                    is_owner: inter.is_owner || false
                  });
                }
                const dateStr = inter.date.substring(0, 10);
                if (groupedData[dateStr]) {
                  groupedData[dateStr][b.slug] += 1;
                  if (isVisit(inter.platform)) {
                    sumVisitas++;
                    visitasNegocio++;
                  } else {
                    sumContactos++;
                    redesCount[inter.platform] = (redesCount[inter.platform] || 0) + 1;
                  }
                }
              });
              newNetworkStats.push({ business: b, redes: redesCount, visitas: visitasNegocio, users: uniqueUsers });
            });
          }

          setGlobalStats({ totalVisitas: sumVisitas, totalContactos: sumContactos });
          setChartData(Object.values(groupedData));
          setNetworkStats(newNetworkStats);
        }

      } catch (error) {
        console.error("Error cargando métricas", error);
      } finally {
        setIsLoadingChart(false);
      }
    };

    loadMetrics();
  }, [viewMode, selectedBusinesses, days, customStartDate, customEndDate, API_URL]);


  // Descargar PDF
  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    
    // Título
    doc.setFontSize(18);
    doc.text("Reporte de Analíticas - Tarjetoso", 14, 22);
    
    // Periodo
    doc.setFontSize(11);
    let periodText = "";
    if (days === 'custom') {
      periodText = `Periodo: ${customStartDate} al ${customEndDate}`;
    } else {
      periodText = `Periodo: Últimos ${days} días`;
    }
    doc.text(periodText, 14, 30);
    doc.text(`Modo: ${viewMode === 'global' ? 'Toda la aplicación' : 'Comparativa de Negocios'}`, 14, 36);
    
    // Resumen Global
    doc.text(`Total Visitas: ${globalStats.totalVisitas}`, 14, 46);
    doc.text(`Total Contactos a Redes/WhatsApp: ${globalStats.totalContactos}`, 14, 52);
    
    // Tablas Separadas por Negocio
    if (networkStats.length > 0) {
      let finalY = 60;
      
      networkStats.forEach(stat => {
        // Título del Negocio
        doc.setFontSize(14);
        doc.setTextColor(30, 61, 81); // #1A535C
        doc.text(`Negocio: ${stat.business.name}`, 14, finalY);
        finalY += 6;

        // Tabla de Interacciones
        const metricsHead = [["Métrica / Plataforma", "Total Clics / Visitas"]];
        const metricsBody = [
          ["Visitas al Perfil", stat.visitas]
        ];
        
        if (Object.keys(stat.redes).length > 0) {
          Object.entries(stat.redes).sort((a,b) => b[1]-a[1]).forEach(([plat, count]) => {
            metricsBody.push([plat.charAt(0).toUpperCase() + plat.slice(1), count]);
          });
        }
        
        autoTable(doc, {
          head: metricsHead,
          body: metricsBody,
          startY: finalY,
          styles: { fontSize: 10, cellPadding: 3 },
          headStyles: { fillColor: [30, 61, 81] }
        });
        
        finalY = doc.lastAutoTable.finalY + 8;

        // Tabla de Usuarios Únicos (Si existen)
        if (stat.users && stat.users.size > 0) {
          doc.setFontSize(11);
          doc.text(`Usuarios Registrados que interactuaron (${stat.users.size}):`, 14, finalY);
          finalY += 6;
          
          const usersHead = [["Nombre de Usuario", "Teléfono"]];
          const usersBody = Array.from(stat.users.values()).map(u => [
            u.is_owner ? `${u.name} (Dueño)` : u.name, 
            u.phone
          ]);
          
          autoTable(doc, {
            head: usersHead,
            body: usersBody,
            startY: finalY,
            styles: { fontSize: 9, cellPadding: 2 },
            headStyles: { fillColor: [249, 132, 44] } // Naranja (Secundario)
          });
          
          finalY = doc.lastAutoTable.finalY + 15;
        } else {
          finalY += 10;
        }
      });
    }
    
    doc.save("Reporte_Analiticas_Tarjetoso.pdf");
  };

  const getChartAreas = () => {
    if (viewMode === 'global' || (viewMode === 'compare' && selectedBusinesses.length === 1)) {
      return [
        { dataKey: 'Visitas', name: 'Visitas', color: '#1A535C' },
        { dataKey: 'Redes / WhatsApp', name: 'Redes / WhatsApp', color: '#F9842C', customName: 'Redes / WhatsApp' }
      ];
    } else if (viewMode === 'compare' && selectedBusinesses.length > 1) {
      return selectedBusinesses.map(b => ({
        dataKey: b.slug,
        name: b.name,
        color: b.color
      }));
    }
    return [];
  };

  const chartAreas = getChartAreas();

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
      
      {/* HEADER DE CONTROLES */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-20">
        <h2 className="text-xl font-extrabold text-[#1A535C] flex items-center gap-2">
          <BarChart2 size={24} className="text-[#F9842C]" />
          Analíticas
        </h2>

        <div className="flex flex-col sm:flex-row w-full lg:w-auto gap-3 items-start sm:items-center flex-wrap">
          {/* Selector de Modo */}
          <div className="flex bg-gray-100 p-1 rounded-xl w-full sm:w-auto shrink-0">
            <button
              onClick={() => setViewMode('global')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'global' ? 'bg-white shadow-sm text-[#1A535C]' : 'text-[#757778] hover:text-[#757778]'}`}
            >
              <Globe size={16} /> Aplicación
            </button>
            <button
              onClick={() => setViewMode('compare')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'compare' ? 'bg-white shadow-sm text-[#1A535C]' : 'text-[#757778] hover:text-[#757778]'}`}
            >
              <Building size={16} /> Negocios
            </button>
          </div>

          {/* Selector de Días y Fechas Custom */}
          <div className="flex flex-wrap gap-2 w-full sm:w-auto shrink-0">
            <div className="relative flex-1 sm:flex-none">
              <select 
                value={days}
                onChange={(e) => setDays(e.target.value === 'custom' ? 'custom' : Number(e.target.value))}
                className="w-full bg-gray-50 border border-gray-200 pl-10 pr-4 py-2.5 rounded-xl outline-none focus:border-[#F9842C] focus:ring-1 focus:ring-[#F9842C]/30 text-sm font-bold text-[#1A535C] appearance-none cursor-pointer min-w-[140px]"
              >
                <option value={7}>Últimos 7 días</option>
                <option value={14}>Últimos 14 días</option>
                <option value={30}>Últimos 30 días</option>
                <option value="custom">Personalizado...</option>
              </select>
              <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            {days === 'custom' && (
              <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 w-full sm:w-auto">
                <input 
                  type="date" 
                  value={customStartDate} 
                  onChange={e => setCustomStartDate(e.target.value)}
                  className="bg-gray-50 border border-gray-200 px-3 py-2.5 rounded-xl outline-none text-sm font-bold text-[#757778] focus:border-[#F9842C] w-full sm:w-auto"
                />
                <span className="text-gray-400">-</span>
                <input 
                  type="date" 
                  value={customEndDate} 
                  onChange={e => setCustomEndDate(e.target.value)}
                  className="bg-gray-50 border border-gray-200 px-3 py-2.5 rounded-xl outline-none text-sm font-bold text-[#757778] focus:border-[#F9842C] w-full sm:w-auto"
                />
              </div>
            )}
          </div>
          
          {/* Botón Exportar */}
          {chartData.length > 0 && (
            <button 
              onClick={handleDownloadPDF}
              className="w-full sm:w-auto bg-[#1A535C] hover:bg-[#133d44] text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors shrink-0 shadow-sm"
              title="Descargar Reporte en PDF"
            >
              <Download size={18} />
              <span className="hidden lg:inline">Descargar PDF</span>
            </button>
          )}

        </div>
      </div>

      {/* TARJETAS RESUMEN (KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-[#1A535C] rounded-3xl p-6 shadow-sm border border-[#1A535C]/10 text-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
          <p className="text-[#E6E2DF] font-bold mb-1 text-xs uppercase tracking-widest relative z-10">Total Visitas a Tarjetas</p>
          <div className="flex items-end gap-3 relative z-10">
            <h3 className="text-4xl font-black">{globalStats.totalVisitas}</h3>
            <span className="text-sm bg-white/10 px-2 py-1 rounded-lg font-medium mb-1">
              {days === 'custom' ? 'Rango' : `En ${days} días`}
            </span>
          </div>
        </div>
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#F9842C]/5 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
          <p className="text-[#757778] font-bold mb-1 text-xs uppercase tracking-widest relative z-10">Clics Redes & WhatsApp</p>
          <div className="flex items-end gap-3 relative z-10">
            <h3 className="text-4xl font-black text-[#F9842C]">{globalStats.totalContactos}</h3>
            <span className="text-sm bg-gray-50 text-[#757778] border border-gray-100 px-2 py-1 rounded-lg font-medium mb-1">
              {days === 'custom' ? 'Rango' : `En ${days} días`}
            </span>
          </div>
        </div>
      </div>

      {/* BUSCADOR COMPARADOR */}
      {viewMode === 'compare' && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 relative z-10">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-4">
            <h3 className="font-bold text-[#757778]">Selecciona Negocios a Comparar</h3>
            <button 
              onClick={handleAddAllBusinesses}
              disabled={isLoadingAll}
              className="text-sm font-bold bg-[#1A535C] hover:bg-[#152b39] text-white px-4 py-2 rounded-xl transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isLoadingAll ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              Cargar Todos (Top 50)
            </button>
          </div>
          
          <div className="relative">
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input 
              type="text" 
              placeholder="Selecciona o busca negocios para graficar..." 
              value={searchTerm}
              onFocus={() => setShowDropdown(true)}
              onClick={() => setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowDropdown(true);
              }}
              className="w-full bg-white border border-gray-200 py-3.5 pl-12 pr-10 rounded-2xl outline-none focus:border-[#F9842C] focus:ring-4 focus:ring-[#F9842C]/10 transition-all font-medium text-[#1A535C] shadow-sm"
            />
            {isSearching && <Loader2 size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#F9842C] animate-spin" />}

            {/* Resultados flotantes — posicionados relativos al input */}
            {showDropdown && searchResults.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-hidden z-[100] max-h-72 overflow-y-auto">
                {searchResults.map(b => (
                  <button 
                    key={b.slug}
                    onMouseDown={(e) => { e.preventDefault(); handleAddBusiness(b); }}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center justify-between border-b border-gray-50 last:border-0"
                  >
                    <div>
                      <p className="font-bold text-[#1A535C]">{b.name}</p>
                      <p className="text-xs text-[#757778]">{b.category}</p>
                    </div>
                    <Plus size={18} className="text-[#F9842C]" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Chips de negocios seleccionados */}
          {selectedBusinesses.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-50">
              {selectedBusinesses.map(b => (
                <div 
                  key={b.slug}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl border font-bold text-sm"
                  style={{ borderColor: b.color, backgroundColor: `${b.color}10`, color: b.color }}
                >
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: b.color }}></div>
                  {b.name}
                  <button onClick={() => handleRemoveBusiness(b.slug)} className="hover:opacity-70 ml-1">
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* GRÁFICA */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 z-0">
        <h3 className="font-bold text-[#757778] mb-6 flex items-center gap-2">
          {viewMode === 'global' ? 'Comportamiento de la App (Visitas vs Contactos)' : 
           (selectedBusinesses.length === 1 ? `Comportamiento de ${selectedBusinesses[0].name}` : 'Comparativa de Interacciones Totales')}
        </h3>

        {viewMode === 'compare' && selectedBusinesses.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center">
            <BarChart2 size={48} className="text-gray-200 mb-4" />
            <p className="text-gray-400 font-bold max-w-sm mx-auto">
              Busca y selecciona uno o más negocios arriba para cargar la gráfica.
            </p>
          </div>
        ) : isLoadingChart ? (
          <div className="py-20 flex justify-center">
            <Loader2 size={40} className="animate-spin text-[#F9842C]" />
          </div>
        ) : chartData.length > 0 && chartAreas.length > 0 ? (
          <div className="w-full h-[450px] min-h-[450px]">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <defs>
                  {chartAreas.map(a => (
                    <linearGradient key={`color${a.dataKey}`} id={`color${a.dataKey}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={a.color} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={a.color} stopOpacity={0}/>
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="displayDate" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} dx={-10} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                  labelStyle={{ fontWeight: 'bold', color: '#1A535C', marginBottom: '8px' }}
                  formatter={(value, name) => {
                    const area = chartAreas.find(a => a.dataKey === name);
                    return [value, area ? (area.customName || area.name) : name];
                  }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  wrapperStyle={{ paddingTop: '30px' }}
                  formatter={(value, entry) => {
                    const area = chartAreas.find(a => a.dataKey === value);
                    return <span style={{ color: entry.color, fontWeight: 'bold' }}>{area ? (area.customName || area.name) : value}</span>;
                  }}
                />
                
                {chartAreas.map(a => (
                  <Area 
                    key={a.dataKey}
                    type="monotone" 
                    dataKey={a.dataKey} 
                    name={a.dataKey}
                    stroke={a.color} 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill={`url(#color${a.dataKey})`} 
                    activeDot={{ r: 6, strokeWidth: 0, fill: a.color }}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="py-10 text-center text-gray-400 font-bold">No hay datos disponibles en este periodo.</div>
        )}

        {/* DESGLOSE DE REDES DEBAJO DE LA GRÁFICA */}
        {chartData.length > 0 && networkStats.length > 0 && (
          <div className="mt-8 pt-8 border-t border-gray-100">
            <h4 className="font-bold text-[#1A535C] mb-4">Desglose de Redes y Contactos</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {networkStats.map((stat, i) => (
                <div key={i} className="bg-gray-50 rounded-2xl p-4 border border-gray-100 relative group overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl" style={{ backgroundColor: stat.business.color || '#1A535C' }}></div>
                  <p className="font-black text-[#757778] mb-3 truncate pl-2" style={{ color: stat.business.color || '#1A535C' }}>
                    {stat.business.name}
                  </p>
                  {Object.keys(stat.redes).length === 0 ? (
                    <p className="text-xs text-gray-400 font-medium pl-2">Sin clics en redes registrados</p>
                  ) : (
                    <div className="space-y-2 pl-2">
                      {Object.entries(stat.redes).sort((a,b) => b[1]-a[1]).map(([plataforma, cantidad]) => (
                        <div key={plataforma} className="flex justify-between items-center text-sm">
                          <span className="font-medium text-[#757778] capitalize">{plataforma}</span>
                          <span className="font-bold text-[#F9842C] bg-[#F9842C]/10 px-2 py-0.5 rounded-lg">{cantidad}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
