import { useState, useEffect } from 'react';
import fetchAuth from '../../../utils/fetchAuth';

const isVisit = (platform) => platform === 'perfil_view' || platform === 'Visita Perfil';

export default function useAnalyticsData({
  API_URL,
  viewMode,
  days,
  customStartDate,
  customEndDate,
  selectedBusinesses
}) {
  const [chartData, setChartData] = useState([]);
  const [networkStats, setNetworkStats] = useState([]);
  const [globalStats, setGlobalStats] = useState({ totalVisitas: 0, totalContactos: 0 });
  const [isLoadingChart, setIsLoadingChart] = useState(false);

  useEffect(() => {
    const loadMetrics = async () => {
      if (days === 'custom') {
        if (!customStartDate || !customEndDate) return;
        if (new Date(customStartDate) > new Date(customEndDate)) return;
      }

      setIsLoadingChart(true);
      try {
        const groupedData = {};
        
        if (days === 'custom') {
          const startDateObj = new Date(customStartDate + "T00:00:00");
          const endDateObj = new Date(customEndDate + "T23:59:59");
          const totalDays = Math.ceil((endDateObj - startDateObj) / (1000 * 60 * 60 * 24));
          
          for (let i = 0; i <= totalDays; i++) {
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

        let queryParams = `days=${days === 'custom' ? 14 : days}`; 
        if (days === 'custom') {
          queryParams = `start_date=${customStartDate}&end_date=${customEndDate}`;
        }

        if (viewMode === 'global') {
          const res = await fetchAuth(`${API_URL}/admin/analytics/global?${queryParams}`);
          if (!res.ok) throw new Error("Error fetching global");
          const data = await res.json();
          
          let sumVisitas = 0;
          let sumContactos = 0;
          let redesCount = {};
          let uniqueUsersGlobal = new Map();

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

  return { chartData, networkStats, globalStats, isLoadingChart };
}
