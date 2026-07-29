import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import BottomNavbar from '../../components/BottomNavbar';
import { useMetricsData } from './hooks/useMetricsData';
import MetricsHeader from './components/MetricsHeader';
import MetricsSummaryCards from './components/MetricsSummaryCards';
import MetricsChart from './components/MetricsChart';
import MetricsPremiumLock from './components/MetricsPremiumLock';

export default function MetricsDashboard() {
  const { slug } = useParams();
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('spingamma_user') !== null);
  // eslint-disable-next-line no-unused-vars
  const [isAdmin, setIsAdmin] = useState(() => {
    const stored = localStorage.getItem('spingamma_user');
    if (stored) {
      try { 
        const parsed = JSON.parse(stored);
        return parsed.is_admin === true || parsed.is_vendedor === true; 
      } catch { return false; }
    }
    return false;
  });

  const handleLogout = () => {
    localStorage.removeItem('spingamma_user');
    localStorage.removeItem('spingamma_token');
    setIsLoggedIn(false);
    navigate('/');
  };

  const {
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
  } = useMetricsData(slug);

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
        <MetricsHeader 
          navigate={navigate}
          isPremium={isPremium}
          timeFilter={timeFilter}
          setTimeFilter={setTimeFilter}
          customStart={customStart}
          setCustomStart={setCustomStart}
          customEnd={customEnd}
          setCustomEnd={setCustomEnd}
        />

        {isPremium ? (
          <>
            <MetricsSummaryCards totalVistas={totalVistas} totalClics={totalClics} />
            <MetricsChart data={data} />
          </>
        ) : (
          <MetricsPremiumLock navigate={navigate} />
        )}
      </div>

      <BottomNavbar 
        isLoggedIn={isLoggedIn} 
        isAdmin={isAdmin} 
        onHomeClick={() => navigate('/')} 
      />
    </div>
  );
}
