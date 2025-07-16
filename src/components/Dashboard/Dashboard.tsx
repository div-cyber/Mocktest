import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import DashboardHome from './DashboardHome';
import EngineeringSection from '../Sections/EngineeringSection';
import MedicalSection from '../Sections/MedicalSection';
import Chat from '../Chat/Chat';
import AdminPanel from '../Admin/AdminPanel';
import Profile from '../Profile/Profile';
import Settings from '../Settings/Settings';
import Notifications from '../Notifications/Notifications';
import { useAuth } from '../../contexts/AuthContext';

export type ActiveSection = 'dashboard' | 'engineering' | 'medical' | 'chat' | 'admin' | 'profile' | 'settings' | 'notifications';

const Dashboard: React.FC = () => {
  const [activeSection, setActiveSection] = useState<ActiveSection>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardHome />;
      case 'engineering':
        return <EngineeringSection />;
      case 'medical':
        return <MedicalSection />;
      case 'chat':
        return <Chat />;
      case 'admin':
        return user?.role === 'admin' ? <AdminPanel /> : <DashboardHome />;
      case 'profile':
        return <Profile />;
      case 'settings':
        return <Settings />;
      case 'notifications':
        return <Notifications />;
      default:
        return <DashboardHome />;
    }
  };

  return (
    <div className="h-screen flex bg-gray-50">
      <Sidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          activeSection={activeSection}
          onNotificationClick={() => setActiveSection('notifications')}
        />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-4">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;