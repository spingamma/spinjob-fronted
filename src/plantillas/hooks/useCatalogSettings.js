import { useState } from 'react';

export function useCatalogSettings({
  deliveryMethods,
  setDeliveryMethods,
  setOrdersEnabled
}) {
  const [isDeliveryOpen, setIsDeliveryOpen] = useState(false);
  const [newDeliveryMethod, setNewDeliveryMethod] = useState('');
  const [editingDeliveryIndex, setEditingDeliveryIndex] = useState(null);
  const [editingDeliveryText, setEditingDeliveryText] = useState('');
  const [isSelectingPickupPoint, setIsSelectingPickupPoint] = useState(false);
  
  const enablePaqueterias = true;

  const handleOrdersEnabledChange = (e) => {
    const isChecked = e.target.checked;
    setOrdersEnabled(isChecked);
    if (isChecked && (!deliveryMethods || deliveryMethods.length === 0)) {
      if (setDeliveryMethods) {
        setDeliveryMethods(["Entrega en el local"]);
      }
    }
  };

  const handleAddDeliveryMethod = (e) => {
    e.preventDefault();
    if (!newDeliveryMethod.trim() || !setDeliveryMethods) return;
    setDeliveryMethods([...deliveryMethods, newDeliveryMethod.trim()]);
    setNewDeliveryMethod('');
  };

  const handleRemoveDeliveryMethod = (index) => {
    if (!setDeliveryMethods) return;
    setDeliveryMethods(deliveryMethods.filter((_, idx) => idx !== index));
  };

  const handleStartEditDelivery = (index, text) => {
    setEditingDeliveryIndex(index);
    setEditingDeliveryText(text);
  };

  const handleSaveEditDelivery = (index) => {
    if (!setDeliveryMethods || !editingDeliveryText.trim()) return;
    const newMethods = [...deliveryMethods];
    newMethods[index] = editingDeliveryText.trim();
    setDeliveryMethods(newMethods);
    setEditingDeliveryIndex(null);
    setEditingDeliveryText('');
  };

  const handleSelectPickupPoint = (point) => {
    const fee = (point.pickup_fee !== null && point.pickup_fee !== undefined) ? point.pickup_fee : 0;
    const methodStr = `PAQUETERIA|${point.id}|${point.name}|${fee}`;
    if (setDeliveryMethods && !deliveryMethods.includes(methodStr)) {
      setDeliveryMethods([...deliveryMethods, methodStr]);
    }
    setIsSelectingPickupPoint(false);
  };

  return {
    isDeliveryOpen,
    setIsDeliveryOpen,
    newDeliveryMethod,
    setNewDeliveryMethod,
    editingDeliveryIndex,
    setEditingDeliveryIndex,
    editingDeliveryText,
    setEditingDeliveryText,
    isSelectingPickupPoint,
    setIsSelectingPickupPoint,
    enablePaqueterias,
    
    handleOrdersEnabledChange,
    handleAddDeliveryMethod,
    handleRemoveDeliveryMethod,
    handleStartEditDelivery,
    handleSaveEditDelivery,
    handleSelectPickupPoint
  };
}
