import { useEffect, useState } from 'react';
import { API_URL } from '../../config/api';

export default function useFetchProfileData({ isEditing }) {
  const [specialtiesData, setSpecialtiesData] = useState([]);

  useEffect(() => {
    if (isEditing) {
      fetch(`${API_URL}/specialties/grouped`)
        .then(res => res.ok ? res.json() : [])
        .then(data => setSpecialtiesData(data))
        .catch(err => console.error("Error fetching specialties:", err));
    }
  }, [isEditing]);

  return { specialtiesData };
}
