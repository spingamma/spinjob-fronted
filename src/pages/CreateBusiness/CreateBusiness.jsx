import React from 'react';
import { useNavigate } from 'react-router-dom';
import PlantillaGenerica from '../../plantillas/PlantillaGenerica';

export default function CreateBusiness() {
  const navigate = useNavigate();
  
  // Objeto vacío para que PlantillaGenerica funcione como lienzo en blanco
  const blankProfesional = {
    name: '',
    title: '',
    category: '',
    subcategories: '',
    description: '',
    experience_years: '',
    credentials: '',
    phone: '',
    whatsapp: '',
    whatsapp_numbers: '[]',
    facebook: '',
    instagram: '',
    linkedin: '',
    tiktok: '',
    github: '',
    website: '',
    country: 'Bolivia',
    state: '',
    home_delivery: false,
    national_delivery: false,
    ubicacion_url: '',
    image: null,
    owner_id: null
  };

  const handleProtectedAction = (actionParams) => {
    // Para creación no deberíamos necesitar login modal acá,
    // ya que App.jsx ya protege la ruta /crear-negocio
    // Pero si hace falta, lo manejamos.
  };

  return (
    <PlantillaGenerica 
      profesional={blankProfesional} 
      volverAtras={() => navigate('/')}
      onProtectedAction={handleProtectedAction}
      isCreateMode={true} 
    />
  );
}