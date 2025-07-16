import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Home, 
  Wrench, 
  Heart, 
  MessageCircle, 
  Settings, 
  LogOut,
  X,
  Shield,
  User
} from 'lucide-react';
import type { ActiveSection } from './Dashboard';

interface SidebarProps {
  activeSection: ActiveSection;
  setActiveSection: (section: ActiveSection) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeSection, 
  setActiveSection, 
  isOpen, 
  setIsOpen 
}) => {
  const { user, logout } = useAuth();

  const menuItems = [
    { id: 'dashboard' as const, name: 'Dashboard', icon: Home },
    { id: 'engineering' as const, name: 'Engineering', icon: Wrench },
    { id: 'medical' as const, name: 'Medical', icon: Heart },
    { id: 'chat' as const, name: 'Chat', icon: MessageCircle },
    { id: 'profile' as const, name: 'Profile', icon: User },
    ...(user?.role === 'admin' ? [{ id: 'admin' as const, name: 'Admin Panel', icon: Shield }] : []),
  ];

  const handleItemClick = (section: ActiveSection) => {
    setActiveSection(section);
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">MT</span>
            </div>
            <span className="text-xl font-bold text-gray-900">MockTest</span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex flex-col h-full">
          {/* User Profile */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <img
                src={user?.avatar || `https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2`}
                alt={user?.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500 truncate capitalize">
                  {user?.role} • {user?.section}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  className={`
                    w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200
                    ${isActive 
                      ? 'bg-black text-white shadow-md' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }
                  `}
                >
                  <Icon className={`mr-3 h-5 w-5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                  {item.name}
                </button>
              );
            })}
          </nav>

          {/* Bottom Actions */}
          <div className="p-4 border-t border-gray-200 space-y-2">
            <button 
              onClick={() => handleItemClick('settings' as ActiveSection)}
              className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200"
            >
              <Settings className="mr-3 h-5 w-5 text-gray-400" />
              Settings
            </button>
            <button 
              onClick={logout}
              className="w-full flex items-center px-3 py-2 text-sm font-medium text-red-600 rounded-lg hover:text-red-700 hover:bg-red-50 transition-colors duration-200"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;