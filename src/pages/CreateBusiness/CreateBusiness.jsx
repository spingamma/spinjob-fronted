import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PlantillaGenerica from '../../plantillas/PlantillaGenerica';
import fetchAuth from '../../utils/fetchAuth';
import { API_URL } from '../../config/api';

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

export default function CreateBusiness() {
  const navigate = useNavigate();
  const { slug } = useParams();
  const [profesional, setProfesional] = useState(null);
  const [loading, setLoading] = useState(!!slug);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (slug) {
      fetchAuth(`${API_URL}/businesses/${slug}`)
        .then(res => {
          if (!res.ok) throw new Error("Error loading business");
          return res.json();
        })
        .then(data => {
          setProfesional(data);
          setLoading(false);
        })
        .catch(err => {
          setError(err.message);
          setLoading(false);
        });
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setProfesional(blankProfesional);
    }
  }, [slug]);

  // eslint-disable-next-line no-unused-vars
  const handleProtectedAction = (actionParams) => {
    // Para creación no deberíamos necesitar login modal acá
  };

  if (loading) {
    return <div className="text-center p-10 mt-20 text-primary font-bold">Cargando datos del negocio...</div>;
  }

  if (error) {
    return <div className="text-center p-10 mt-20 text-red-500">Error: {error}</div>;
  }

  return (
    <PlantillaGenerica 
      profesional={profesional} 
      volverAtras={() => navigate('/')}
      onProtectedAction={handleProtectedAction}
      isCreateMode={!slug}
      initialIsEditing={true}
    />
  );
}