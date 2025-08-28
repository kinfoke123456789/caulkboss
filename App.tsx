import React, { useState } from 'react';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import EstimationPage from './pages/Estimation';
import DispatchPage from './pages/Dispatch';
import InvoicingPage from './pages/Invoicing';
import WalkieTalkiePage from './pages/WalkieTalkie';
import CrewsPage from './pages/Crews';
import IntelligencePage from './pages/Intelligence';
import { AppProvider } from './context/AppContext';

export type Tab = 'estimate' | 'dispatch' | 'crews' | 'intelligence' | 'comms';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('estimate');

  const renderContent = () => {
    switch (activeTab) {
      case 'estimate':
        return <EstimationPage />;
      case 'dispatch':
        return <DispatchPage />;
      case 'crews':
        return <CrewsPage />;
      case 'intelligence':
        return <IntelligencePage />;
      case 'comms':
        return <WalkieTalkiePage />;
      default:
        return <EstimationPage />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-8 mb-20"> 
        {renderContent()}
      </main>
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

const App: React.FC = () => (
  <AppProvider>
    <AppContent />
  </AppProvider>
);


export default App;