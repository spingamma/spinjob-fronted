// Archivo: src/App.jsx
import { Suspense, lazy, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import ReloadPrompt from './components/ReloadPrompt';

// Lazy load de Vistas
const Directory = lazy(() => import('./pages/Directory/Directory'));
const Profile = lazy(() => import('./pages/Profile/Profile'));
const CreateBusiness = lazy(() => import('./pages/CreateBusiness/CreateBusiness'));
const MyBusinesses = lazy(() => import('./pages/MyBusinesses/MyBusinesses'));
const AdminPanel = lazy(() => import('./pages/AdminPanel/AdminPanel'));
const BusinessCardHolder = lazy(() => import('./pages/BusinessCardHolder/BusinessCardHolder'));
const MetricsDashboard = lazy(() => import('./pages/MetricsDashboard/MetricsDashboard'));
const OrderSummary = lazy(() => import('./pages/OrderSummary/OrderSummary'));
const BusinessOrders = lazy(() => import('./pages/MyBusinesses/BusinessOrders'));
const MyOrders = lazy(() => import('./pages/MyOrders/MyOrders'));

function App() {
  // Dismiss the HTML splash screen once React mounts
  useEffect(() => {
    const splash = document.getElementById('splash-screen');
    if (splash) {
      splash.classList.add('fade-out');
      setTimeout(() => splash.remove(), 500);
    }
  }, []);

  return (
    <>
    <Suspense fallback={
      <div
        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#1D565F]"
        role="status"
        aria-label="Cargando aplicación..."
      >
        <img
          src="/icon-512.webp"
          alt="Tarjetoso"
          className="w-[120px] h-[120px] rounded-3xl animate-pulse"
        />
        <span className="mt-5 text-white text-[22px] font-bold tracking-wide">
          Tarjetoso
        </span>
        <div className="mt-7 flex gap-2">
          <span className="w-2 h-2 rounded-full bg-white/40 animate-bounce [animation-delay:0ms]"></span>
          <span className="w-2 h-2 rounded-full bg-white/40 animate-bounce [animation-delay:200ms]"></span>
          <span className="w-2 h-2 rounded-full bg-white/40 animate-bounce [animation-delay:400ms]"></span>
        </div>
      </div>
    }>
      <Routes>
        <Route path="/" element={<Directory />} />
        <Route path="/directorio/:categoria" element={<Directory />} />
        <Route path="/directorio/:categoria/:estado" element={<Directory />} />
        <Route path="/perfil/:slug" element={<Profile />} />
        <Route path="/crear-negocio" element={<CreateBusiness />} />
        <Route path="/editar-negocio/:slug" element={<CreateBusiness />} />
        <Route path="/mis-negocios" element={<MyBusinesses />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/tarjetero" element={<BusinessCardHolder />} />
        <Route path="/metricas/:slug" element={<MetricsDashboard />} />
        <Route path="/perfil/:slug/orden" element={<OrderSummary />} />
        <Route path="/mis-pedidos/:slug" element={<BusinessOrders />} />
        <Route path="/mis-compras" element={<MyOrders />} />
      </Routes>
    </Suspense>
      <ReloadPrompt />
    </>
  );
}

export default App;