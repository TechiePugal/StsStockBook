import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  Building2, 
  Factory, 
  ArrowRight, 
  ArrowLeft, 
  BookOpen,
  X,
  Menu
} from 'lucide-react';

interface SidebarProps {
  activeModule: string;
  setActiveModule: (module: any) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeModule, 
  setActiveModule, 
  sidebarOpen, 
  setSidebarOpen 
}) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'parts', label: 'Parts Management', icon: Package },
    { id: 'suppliers', label: 'Suppliers Management', icon: Building2 },
    { id: 'companies', label: 'Companies Management', icon: Factory },
    { id: 'smw-to-supplier', label: 'SMW to Supplier', icon: ArrowRight },
    { id: 'supplier-to-company', label: 'Supplier to Company', icon: ArrowLeft },
    { id: 'stock-ledger', label: 'Stock Ledger', icon: BookOpen },
  ];

  return (
    <>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 flex w-full max-w-xs flex-col">
            <div className="flex h-16 flex-shrink-0 items-center justify-between bg-gradient-to-r from-blue-900 to-blue-800 px-4">
              <h1 className="text-xl font-bold text-white">Inventory System</h1>
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-white hover:text-blue-200"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="flex flex-1 flex-col overflow-y-auto bg-white">
              <nav className="flex-1 space-y-1 px-2 py-4">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveModule(item.id);
                        setSidebarOpen(false);
                      }}
                      className={`group flex w-full items-center rounded-md px-2 py-2 text-sm font-medium transition-all duration-200 ${
                        activeModule === item.id
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                          : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                      }`}
                    >
                      <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                      {item.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white shadow-xl">
          <div className="flex h-16 shrink-0 items-center bg-gradient-to-r from-blue-900 to-blue-800 px-6">
            <h1 className="text-xl font-bold text-white">Inventory System</h1>
          </div>
          <nav className="flex flex-1 flex-col px-6">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <li key={item.id}>
                        <button
                          onClick={() => setActiveModule(item.id)}
                          className={`group flex w-full items-center rounded-md px-2 py-2 text-sm font-medium transition-all duration-200 ${
                            activeModule === item.id
                              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                              : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                          }`}
                        >
                          <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                          {item.label}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
};

export default Sidebar;