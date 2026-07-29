import { useState, useEffect, useMemo } from 'react';
import fetchAuth from '../../../utils/fetchAuth';
import { API_URL } from '../../../config/api';

export function useMetricsData(slug) {
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(true);
  
  // Filtros
  const [timeFilter, setTimeFilter] = useState('general');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await fetchAuth(`${API_URL}/businesses/${slug}/metrics`);
        if (res.status === 403) {
          setIsPremium(false);
          setMetrics([]);
        } else if (res.ok) {
          const data = await res.json();
          setMetrics(data);
          setIsPremium(true);
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

  return {
    loading,
    isPremium,
    timeFilter,
    setTimeFilter,
    customStart,
    setCustomStart,
    customEnd,
    setCustomEnd,
    data,
    totalVistas,
    totalClics
  };
}
