import React from 'react';
import { Menu, Bell, Search } from 'lucide-react';
import type { ActiveSection } from './Dashboard';

interface HeaderProps {
  onMenuClick: () => void;
  activeSection: ActiveSection;
  onNotificationClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick, activeSection, onNotificationClick }) => {
  const getSectionTitle = (section: ActiveSection) => {
    switch (section) {
      case 'dashboard':
        return 'Dashboard';
      case 'engineering':
        return 'Engineering Section';
      case 'medical':
        return 'Medical Section';
      case 'chat':
        return 'Student Chat';
      case 'admin':
        return 'Admin Panel';
      case 'profile':
        return 'Profile';
      case 'settings':
        return 'Settings';
      case 'notifications':
        return 'Notifications';
      default:
        return 'Dashboard';
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors"
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {getSectionTitle(activeSection)}
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative hidden md:block">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          {/* Notifications */}
          <button 
            onClick={onNotificationClick}
            className="relative p-2 text-gray-400 hover:text-gray-500 transition-colors"
          >
            <Bell className="h-6 w-6" />
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white"></span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;