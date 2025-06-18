import React from 'react';
import { Menu, Bell, User } from 'lucide-react';

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ sidebarOpen, setSidebarOpen }) => {
  return (
    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white/80 backdrop-blur-md px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      <button
        type="button"
        className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        <Menu className="h-6 w-6" />
      </button>

      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <div className="relative flex flex-1 items-center">
          <h2 className="text-lg font-semibold text-gray-900">
            Inventory Management System
          </h2>
        </div>
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          <button className="p-2 text-gray-400 hover:text-gray-500">
            <Bell className="h-6 w-6" />
          </button>
          <div className="h-6 w-px bg-gray-200" />
          <button className="p-2 text-gray-400 hover:text-gray-500">
            <User className="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Header;