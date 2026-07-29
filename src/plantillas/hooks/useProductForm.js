import { useState, useRef, useEffect } from 'react';

export default function useProductForm(isOpen, product, availableCarousels, onHasUnsavedProduct, onSubmit) {
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formCarousel, setFormCarousel] = useState('Catálogo');
  const [formImage, setFormImage] = useState(null);
  const [formPreview, setFormPreview] = useState(null);
  
  const [showCropModal, setShowCropModal] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState(null);

  const textareaRef = useRef(null);

  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  const [prevProduct, setPrevProduct] = useState(product);

  if (isOpen !== prevIsOpen || product !== prevProduct) {
    setPrevIsOpen(isOpen);
    setPrevProduct(product);
    if (isOpen) {
      if (product) {
        setFormName(product.name || '');
        setFormDesc(product.description || '');
        setFormPrice(product.price || '');
        
        const cName = product.carousel_name || 'Catálogo';
        setFormCarousel(cName);
        setFormPreview(product.image_url || null);
        setFormImage(null);
      } else {
        setFormName('');
        setFormDesc('');
        setFormPrice('');
        setFormCarousel(availableCarousels[0] || 'Catálogo');
        setFormImage(null);
        setFormPreview(null);
      }
    }
  }

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [formDesc, isOpen]);

  useEffect(() => {
    if (onHasUnsavedProduct) {
      const isUnsaved = isOpen && (
        formName.trim() !== (product?.name || '').trim() ||
        formDesc.trim() !== (product?.description || '').trim() ||
        formPrice.trim() !== (product?.price || '').trim() ||
        formImage !== null
      );
      onHasUnsavedProduct(!!isUnsaved);
    }
  }, [isOpen, formName, formDesc, formPrice, formImage, product, onHasUnsavedProduct]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCropImageSrc(reader.result);
        setShowCropModal(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropDone = (croppedFile) => {
    setFormImage(croppedFile);
    const reader = new FileReader();
    reader.onloadend = () => setFormPreview(reader.result);
    reader.readAsDataURL(croppedFile);
    setShowCropModal(false);
    setCropImageSrc(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formName.trim()) return;

    onSubmit({
      id: product?.id,
      tempId: product?.tempId,
      name: formName.trim(),
      description: formDesc.trim(),
      price: formPrice.trim(),
      carousel_name: formCarousel.trim() || 'Catálogo',
      image_url: formPreview,
      imageFile: formImage,
      is_visible: product ? product.is_visible : true,
      isModified: true
    });
  };

  return {
    formName, setFormName,
    formDesc, setFormDesc,
    formPrice, setFormPrice,
    formCarousel, setFormCarousel,
    formPreview,
    showCropModal, setShowCropModal,
    cropImageSrc, setCropImageSrc,
    textareaRef,
    handleImageChange,
    handleCropDone,
    handleSubmit
  };
}
