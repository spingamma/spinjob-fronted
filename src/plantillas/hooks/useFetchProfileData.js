import { useEffect, useState } from 'react';
import { API_URL } from '../../config/api';

export default function useFetchProfileData({ isEditing, isCreateMode, slug }) {
  const [specialtiesData, setSpecialtiesData] = useState([]);
  const [localProducts, setLocalProducts] = useState([]);

  useEffect(() => {
    if (isEditing) {
      fetch(`${API_URL}/specialties/grouped`)
        .then(res => res.ok ? res.json() : [])
        .then(data => setSpecialtiesData(data))
        .catch(err => console.error("Error fetching specialties:", err));

      if (!isCreateMode && slug) {
        fetch(`${API_URL}/businesses/${slug}/products`)
          .then(res => res.ok ? res.json() : [])
          .then(data => setLocalProducts(data))
          .catch(err => console.error("Error fetching products:", err));
      }
    }
  }, [isEditing, isCreateMode, slug]);

  return { specialtiesData, localProducts, setLocalProducts };
}
