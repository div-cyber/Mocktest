import React, { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { AppProvider } from './contexts/AppContext';
import Login from './components/Auth/Login';
import Dashboard from './components/Dashboard/Dashboard';
import { useAuth } from './contexts/AuthContext';

function AppContent() {
  const { user } = useAuth();

  if (!user) {
    return <Login />;
  }

  return <Dashboard />;
}

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <div className="min-h-screen bg-gray-50">
          <AppContent />
        </div>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;