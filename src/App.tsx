import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import Dashboard from './components/Dashboard/Dashboard';
import PartsManagement from './components/Masters/PartsManagement';
import SuppliersManagement from './components/Masters/SuppliersManagement';
import CompaniesManagement from './components/Masters/CompaniesManagement';
import SMWToSupplier from './components/Transactions/SMWToSupplier';
import SupplierToCompany from './components/Transactions/SupplierToCompany';
import StockLedger from './components/StockLedger/StockLedger';
import { useInventoryData } from './hooks/useInventoryData';

type ActiveModule = 'dashboard' | 'parts' | 'suppliers' | 'companies' | 'smw-to-supplier' | 'supplier-to-company' | 'stock-ledger';

function App() {
  const [activeModule, setActiveModule] = useState<ActiveModule>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const inventoryData = useInventoryData();

  const renderActiveModule = () => {
    switch (activeModule) {
      case 'dashboard':
        return <Dashboard {...inventoryData} />;
      case 'parts':
        return <PartsManagement {...inventoryData} />;
      case 'suppliers':
        return <SuppliersManagement {...inventoryData} />;
      case 'companies':
        return <CompaniesManagement {...inventoryData} />;
      case 'smw-to-supplier':
        return <SMWToSupplier {...inventoryData} />;
      case 'supplier-to-company':
        return <SupplierToCompany {...inventoryData} />;
      case 'stock-ledger':
        return <StockLedger {...inventoryData} />;
      default:
        return <Dashboard {...inventoryData} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Toaster position="top-right" />
      
      {/* Sidebar */}
      <Sidebar
        activeModule={activeModule}
        setActiveModule={setActiveModule}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* Main Content */}
      <div className="lg:pl-72">
        <Header
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
        
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {renderActiveModule()}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;