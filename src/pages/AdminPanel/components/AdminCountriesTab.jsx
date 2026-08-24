import React from 'react';
import { Loader2 } from 'lucide-react';
import { useCountriesCrud } from "../hooks/useCountriesCrud";
import CountriesHeader from './Countries/CountriesHeader';
import AddCountryForm from './Countries/AddCountryForm';
import CountryCard from './Countries/CountryCard';

export default function AdminCountriesTab() {
  const crud = useCountriesCrud();

  if (crud.loading && crud.countries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="animate-spin text-secondary mb-4" size={40} />
        <p className="text-gray-500 font-medium">Cargando países y departamentos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CountriesHeader 
        fetchCountries={crud.fetchCountries}
        setIsAddingCountry={crud.setIsAddingCountry}
      />

      {crud.error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-2xl border border-red-200 text-sm">
          {crud.error}
        </div>
      )}

      {crud.isAddingCountry && (
        <AddCountryForm 
          newCountryName={crud.newCountryName}
          setNewCountryName={crud.setNewCountryName}
          newCountryDept={crud.newCountryDept}
          setNewCountryDept={crud.setNewCountryDept}
          handleCreateCountry={crud.handleCreateCountry}
          submitting={crud.submitting}
          setIsAddingCountry={crud.setIsAddingCountry}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {crud.countries.map((c) => (
          <CountryCard 
            key={c.country}
            c={c}
            editingCountry={crud.editingCountry}
            setEditingCountry={crud.setEditingCountry}
            editCountryName={crud.editCountryName}
            setEditCountryName={crud.setEditCountryName}
            handleUpdateCountry={crud.handleUpdateCountry}
            handleDeleteCountry={crud.handleDeleteCountry}
            editingDept={crud.editingDept}
            setEditingDept={crud.setEditingDept}
            editDeptName={crud.editDeptName}
            setEditDeptName={crud.setEditDeptName}
            handleUpdateDepartment={crud.handleUpdateDepartment}
            handleDeleteDepartment={crud.handleDeleteDepartment}
            addingDeptToCountry={crud.addingDeptToCountry}
            setAddingDeptToCountry={crud.setAddingDeptToCountry}
            newDeptName={crud.newDeptName}
            setNewDeptName={crud.setNewDeptName}
            handleAddDepartment={crud.handleAddDepartment}
            submitting={crud.submitting}
          />
        ))}
      </div>
    </div>
  );
}
