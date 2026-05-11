// Archivo: src/App.jsx
import { Suspense, lazy } from 'react';
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

function App() {
  return (
    <>
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
      </Routes>
    </Suspense>
      <ReloadPrompt />
    </>
  );
}

export default App;