import React, { useState } from 'react';
import useAnalyticsData from '../hooks/useAnalyticsData';
import { exportAnalyticsPDF } from '../utils/exportAnalyticsPDF';

import AnalyticsHeader from './analytics/AnalyticsHeader';
import AnalyticsKPIs from './analytics/AnalyticsKPIs';
import AnalyticsCompareSearch from './analytics/AnalyticsCompareSearch';
import AnalyticsChart from './analytics/AnalyticsChart';
import AnalyticsNetworkBreakdown from './analytics/AnalyticsNetworkBreakdown';

export default function AdminAnalyticsTab({ API_URL }) {
  const [viewMode, setViewMode] = useState('global');
  const [days, setDays] = useState(90);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [selectedBusinesses, setSelectedBusinesses] = useState([]);

  const { chartData, networkStats, globalStats, isLoadingChart } = useAnalyticsData({
    API_URL,
    viewMode,
    days,
    customStartDate,
    customEndDate,
    selectedBusinesses
  });

  const handleDownloadPDF = () => {
    exportAnalyticsPDF({
      days,
      customStartDate,
      customEndDate,
      viewMode,
      globalStats,
      networkStats
    });
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
      <AnalyticsHeader 
        viewMode={viewMode}
        setViewMode={setViewMode}
        days={days}
        setDays={setDays}
        customStartDate={customStartDate}
        setCustomStartDate={setCustomStartDate}
        customEndDate={customEndDate}
        setCustomEndDate={setCustomEndDate}
        hasChartData={chartData.length > 0}
        onDownloadPDF={handleDownloadPDF}
      />

      <AnalyticsKPIs 
        globalStats={globalStats}
        days={days}
      />

      {viewMode === 'compare' && (
        <AnalyticsCompareSearch 
          API_URL={API_URL}
          selectedBusinesses={selectedBusinesses}
          setSelectedBusinesses={setSelectedBusinesses}
        />
      )}

      <AnalyticsChart 
        viewMode={viewMode}
        selectedBusinesses={selectedBusinesses}
        isLoadingChart={isLoadingChart}
        chartData={chartData}
      />

      <AnalyticsNetworkBreakdown 
        chartData={chartData}
        networkStats={networkStats}
      />
    </div>
  );
}
