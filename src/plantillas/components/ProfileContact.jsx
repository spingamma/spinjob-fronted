import React from 'react';
import { Phone, Globe, Facebook, Instagram, Linkedin, Github, Plus, Trash2 } from 'lucide-react';
import { WhatsappIcon, TiktokIcon } from './ProfileIcons';
import { cleanWhatsappNumber } from '../../utils/phone';

const SocialButton = ({ icon: Icon, label, url, colorClass, onLinkClick }) => {
  if (!url) return null;
  return (
    <button 
      onClick={(e) => onLinkClick(e, label, url)}
      aria-label={`Ir a ${label}`}
      title={label}
      className={`w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm hover:text-white transition-all active:scale-95 border border-gray-100 group ${colorClass}`}
    >
      <Icon size={24} className="transition-transform group-hover:scale-110" />
    </button>
  );
};

export default function ProfileContact({ 
  profesional, 
  waNumbers, 
  links, 
  handleLinkClick,
  isEditing,
  editFormData,
  handleEditChange,
  setEditFormData
}) {
  const handleWaChange = (index, value) => {
    const newWa = [...(editFormData.whatsapp_numbers || [])];
    newWa[index] = value;
    setEditFormData({ ...editFormData, whatsapp_numbers: newWa });
  };

  const handleAddWa = () => {
    const newWa = [...(editFormData.whatsapp_numbers || []), ''];
    setEditFormData({ ...editFormData, whatsapp_numbers: newWa });
  };

  const handleRemoveWa = (index) => {
    const newWa = [...(editFormData.whatsapp_numbers || [])];
    newWa.splice(index, 1);
    setEditFormData({ ...editFormData, whatsapp_numbers: newWa });
  };
  const waNumbersList = (editFormData.whatsapp_numbers && editFormData.whatsapp_numbers.length > 0) 
    ? editFormData.whatsapp_numbers 
    : [''];

  return (
    <>
      {/* 📱 WHATSAPP Y LLAMADAS */}
      <div className="mb-8">
        <h3 className="text-lg font-bold text-[#1A535C] flex items-center gap-2 mb-4">
          <span className="w-1.5 h-6 bg-[#6A431F] rounded-full"></span> Contáctanos
        </h3>
        
        {isEditing ? (
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-100 shadow-sm flex flex-col gap-4">
            <div>
              <label className="text-sm font-bold text-[#1A535C] flex items-center gap-2 mb-2">
                <WhatsappIcon size={16} className="text-[#25D366]" /> Número de WhatsApp (sin código de país)
              </label>
              {waNumbersList.map((num, idx) => (
                <div key={idx} className="flex gap-2 mb-2 items-center">
                  <div className="relative flex-1 flex items-center">
                    <span className="absolute left-3 text-gray-400">
                      <WhatsappIcon size={16} className="text-[#25D366]" />
                    </span>
                    <input 
                      data-testid={`input-whatsapp-${idx}`}
                      value={num} 
                      onChange={(e) => handleWaChange(idx, e.target.value)} 
                      className="w-full text-sm bg-white/60 border border-dashed border-gray-400 focus:border-[#F9842C] focus:bg-white rounded pl-9 p-2 outline-none transition-all"
                      placeholder="Ej. 70012345"
                    />
                  </div>
                  {waNumbersList.length > 1 && (
                    <button 
                      data-testid={`remove-whatsapp-${idx}`}
                      onClick={() => handleRemoveWa(idx)}
                      className="p-2 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors shrink-0"
                      title="Eliminar número"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
              {waNumbersList.length < 2 && (
                <button 
                  data-testid="add-whatsapp-btn"
                  onClick={handleAddWa}
                  className="flex items-center gap-1 text-xs font-bold text-[#F9842C] hover:text-[#e06516] transition-colors mt-2 p-1 rounded hover:bg-orange-50"
                >
                  <Plus size={14} /> Añadir otro número de WhatsApp
                </button>
              )}
            </div>
            <div>
              <label className="text-sm font-bold text-[#1A535C] flex items-center gap-2 mb-1">
                <Phone size={16} className="text-[#1A535C]" /> Teléfono Fijo o Secundario
              </label>
              <input 
                data-testid="input-phone"
                name="phone" 
                value={editFormData.phone || ''} 
                onChange={handleEditChange} 
                className="w-full text-sm bg-white/60 border border-dashed border-gray-400 focus:border-[#F9842C] focus:bg-white rounded p-2 outline-none transition-all"
                placeholder="Ej. 2441234"
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-4">
            {waNumbers.map((num, idx) => {
              const clean = cleanWhatsappNumber(num, profesional?.country || 'Bolivia');
              if (!clean) return null;
              return (
                <button 
                  data-testid={`button-whatsapp-${idx}`}
                  key={`wa-${idx}`}
                  onClick={(e) => handleLinkClick(e, `WhatsApp ${idx + 1}`, `https://wa.me/${clean}`)}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white text-[#1A535C] font-bold flex items-center justify-center shadow-sm hover:bg-[#25D366] hover:text-white border border-gray-200 hover:border-[#25D366] hover:shadow-lg active:scale-[0.98] transition-all group relative"
                  title={`WhatsApp ${idx + 1}`}
                >
                  <WhatsappIcon size={32} className="text-[#25D366] group-hover:text-white transition-colors" />
                  {waNumbers.length > 1 && (
                    <span className="absolute -bottom-2 -right-2 bg-[#25D366] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs border-2 border-white shadow-sm">{idx + 1}</span>
                  )}
                </button>
              );
            })}
            
            {links.phone && (
              <button 
                data-testid="button-phone"
                onClick={(e) => handleLinkClick(e, 'Llamar', links.phone)}
                className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center rounded-2xl bg-white text-[#1A535C] font-bold hover:bg-[#1A535C] hover:text-white transition-colors border border-gray-200 hover:border-[#1A535C] hover:shadow-lg shadow-sm group"
                title="Llamar"
              >
                <Phone size={32} className="text-[#1A535C] group-hover:text-white transition-colors" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* 📱 REDES DE CONTACTO */}
      {(links.website || links.facebook || links.instagram || links.linkedin || links.tiktok || links.github || isEditing) && (
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4 gap-4">
          <h3 className="text-lg font-bold text-[#1A535C] flex items-center gap-2">
            <span className="w-1.5 h-6 bg-[#6A431F] rounded-full"></span> Redes Sociales
          </h3>
        </div>
        
        {isEditing ? (
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-100 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-bold text-purple-600 flex items-center gap-2 mb-1"><Globe size={16} /> Sitio Web</label>
              <input data-testid="input-website" name="website" value={editFormData.website || ''} onChange={handleEditChange} className="w-full text-sm bg-white/60 border border-dashed border-gray-400 focus:border-[#F9842C] rounded p-2 outline-none" placeholder="https://..." />
            </div>
            <div>
              <label className="text-sm font-bold text-blue-600 flex items-center gap-2 mb-1"><Facebook size={16} /> Facebook</label>
              <input data-testid="input-facebook" name="facebook" value={editFormData.facebook || ''} onChange={handleEditChange} className="w-full text-sm bg-white/60 border border-dashed border-gray-400 focus:border-[#F9842C] rounded p-2 outline-none" placeholder="URL de Facebook" />
            </div>
            <div>
              <label className="text-sm font-bold text-pink-600 flex items-center gap-2 mb-1"><Instagram size={16} /> Instagram</label>
              <input data-testid="input-instagram" name="instagram" value={editFormData.instagram || ''} onChange={handleEditChange} className="w-full text-sm bg-white/60 border border-dashed border-gray-400 focus:border-[#F9842C] rounded p-2 outline-none" placeholder="URL de Instagram" />
            </div>
            <div>
              <label className="text-sm font-bold text-sky-600 flex items-center gap-2 mb-1"><Linkedin size={16} /> LinkedIn</label>
              <input data-testid="input-linkedin" name="linkedin" value={editFormData.linkedin || ''} onChange={handleEditChange} className="w-full text-sm bg-white/60 border border-dashed border-gray-400 focus:border-[#F9842C] rounded p-2 outline-none" placeholder="URL de LinkedIn" />
            </div>
            <div>
              <label className="text-sm font-bold text-black flex items-center gap-2 mb-1"><TiktokIcon size={16} /> TikTok</label>
              <input data-testid="input-tiktok" name="tiktok" value={editFormData.tiktok || ''} onChange={handleEditChange} className="w-full text-sm bg-white/60 border border-dashed border-gray-400 focus:border-[#F9842C] rounded p-2 outline-none" placeholder="URL de TikTok" />
            </div>
            <div>
              <label className="text-sm font-bold text-[#757778] flex items-center gap-2 mb-1"><Github size={16} /> GitHub</label>
              <input data-testid="input-github" name="github" value={editFormData.github || ''} onChange={handleEditChange} className="w-full text-sm bg-white/60 border border-dashed border-gray-400 focus:border-[#F9842C] rounded p-2 outline-none" placeholder="URL de GitHub" />
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap justify-center items-center bg-gray-50 p-4 rounded-2xl border border-gray-200/60 gap-4">
            <SocialButton icon={Globe} label="Sitio Web" url={links.website} colorClass="text-purple-500 hover:bg-purple-500" onLinkClick={handleLinkClick} />
            <SocialButton icon={Facebook} label="Facebook" url={links.facebook} colorClass="text-blue-600 hover:bg-blue-600" onLinkClick={handleLinkClick} />
            <SocialButton icon={Instagram} label="Instagram" url={links.instagram} colorClass="text-pink-600 hover:bg-pink-600" onLinkClick={handleLinkClick} />
            <SocialButton icon={Linkedin} label="LinkedIn" url={links.linkedin} colorClass="text-sky-600 hover:bg-sky-600" onLinkClick={handleLinkClick} />
            <SocialButton icon={TiktokIcon} label="TikTok" url={links.tiktok} colorClass="text-black hover:bg-black" onLinkClick={handleLinkClick} />
            <SocialButton icon={Github} label="GitHub" url={links.github} colorClass="text-[#757778] hover:bg-gray-700" onLinkClick={handleLinkClick} />
          </div>
        )}
      </div>
      )}
    </>
  );
}
