import React from 'react';
import { Feather } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-teal-700 text-white p-4 shadow-lg sticky top-0 z-10">
      <div className="max-w-3xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-full">
            <Feather size={24} className="text-amber-300" />
          </div>
          <div>
            <h1 className="text-xl font-bold">مشاعره هوشمند</h1>
            <p className="text-xs text-teal-100 opacity-80">رقابت ادبی با هوش مصنوعی</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;