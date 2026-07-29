// src/components/OrderSummary/Header.jsx

import React from 'react';
import { ArrowLeft } from 'lucide-react';

export default function Header({ navigate, goBack, title }) {
  return (
    <div className="bg-white px-4 py-4 sticky top-0 z-50 shadow-sm flex items-center gap-4">
      <button
        onClick={() => goBack(navigate)}
        className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors"
        data-testid="back-button"
      >
        <ArrowLeft size={20} />
      </button>
      <h1 className="text-lg font-extrabold tracking-tight">
        {title}
      </h1>
    </div>
  );
}
