import { Building, X, Globe, Link as LinkIcon, Phone, MapPin, User, AlignLeft, Briefcase, Map, ShieldCheck, CheckCircle, XCircle } from 'lucide-react';

// Mini-componente para mostrar los campos en solo lectura
export const CampoLectura = ({ label, valor }) => (
  <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
    <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</span>
    <span className="block text-sm font-medium text-[#1E3D51] break-words whitespace-pre-wrap">
      {valor ? valor : <span className="text-gray-300 italic">No especificado</span>}
    </span>
  </div>
);

export default function BusinessDetailsModal({ business, onClose, actions, banner }) {
  if (!business) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#1E3D51]/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#F8F9FA] rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        
        {/* Header con gradiente */}
        <div className="bg-gradient-to-r from-[#1E3D51] to-[#32698F] p-5 flex justify-between items-center text-white shrink-0">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Building size={20} /> Datos del Formulario
          </h2>
          <button onClick={onClose} className="p-1.5 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
        
        {/* Contenido Scrollable */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* Banner Opcional (Status o Instrucciones) */}
          {banner && (
            <div className={`p-4 rounded-xl border text-sm ${banner.type === 'error' ? 'bg-red-50 text-red-800 border-red-200' : banner.type === 'warning' ? 'bg-orange-50 text-orange-800 border-orange-200' : 'bg-blue-50 text-blue-800 border-blue-200'}`}>
              {banner.content}
            </div>
          )}

          {/* Sección: Estado de Suscripción (Solo si existe) */}
          {(business.plan_months || business.expiration_date) && (
            <div>
              <h3 className="font-bold text-[#32698F] border-b border-gray-200 pb-2 mb-3 flex items-center gap-2">
                <ShieldCheck size={18} /> Suscripción y Vigencia
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {business.plan_months && <CampoLectura label="Plan Activado" valor={`${business.plan_months} Meses`} />}
                {business.expiration_date && <CampoLectura label="Fecha de Vencimiento" valor={business.expiration_date} />}
              </div>
            </div>
          )}

          {/* Sección 1: Información Principal */}
          <div>
            <h3 className="font-bold text-[#B95221] border-b border-gray-200 pb-2 mb-3">Información Principal</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <CampoLectura label="Nombre / Marca" valor={business.name} />
              <CampoLectura label="Especialidad" valor={business.title} />
              <CampoLectura label="Categoría" valor={business.category} />
              <CampoLectura label="País" valor={business.country} />
              <CampoLectura label="Ciudad / Departamento" valor={business.state} />
              <CampoLectura label="Zona / Barrio" valor={business.neighborhood} />
              <CampoLectura label="Género" valor={business.genero} />
            </div>
            <div className="mt-3">
              <CampoLectura label="Descripción de Servicios" valor={business.description} />
            </div>
          </div>

          {/* Sección 2: Contacto */}
          <div>
            <h3 className="font-bold text-[#B95221] border-b border-gray-200 pb-2 mb-3">Contacto</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <CampoLectura label="WhatsApp" valor={business.whatsapp} />
              <CampoLectura label="Teléfono Fijo" valor={business.phone} />
            </div>
            <div className="mt-3">
              <CampoLectura label="Link de Ubicación (Maps)" valor={business.ubicacion_url} />
            </div>
          </div>

          {/* Sección 3: Redes Sociales */}
          <div>
            <h3 className="font-bold text-[#B95221] border-b border-gray-200 pb-2 mb-3">Redes Sociales</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <CampoLectura label="Página Web" valor={business.website} />
              <CampoLectura label="Facebook" valor={business.facebook} />
              <CampoLectura label="Instagram" valor={business.instagram} />
              <CampoLectura label="LinkedIn" valor={business.linkedin} />
              <CampoLectura label="TikTok" valor={business.tiktok} />
              <CampoLectura label="GitHub" valor={business.github} />
            </div>
          </div>
        </div>

        {/* Acciones Opcionales (Pie de Modal) */}
        {actions && (
          <div className="p-5 bg-gray-50 border-t border-gray-100 flex gap-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
