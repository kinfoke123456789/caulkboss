import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-gradient-to-r from-slate-800 to-slate-900 text-white shadow-md sticky top-0 z-20">
      <div className="container mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Caulk Boss Pro</h1>
          <p className="text-sm text-slate-300">Project Management Suite</p>
        </div>
        <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center font-bold text-slate-900 text-2xl shadow-inner">
          CB
        </div>
      </div>
    </header>
  );
};

export default Header;
