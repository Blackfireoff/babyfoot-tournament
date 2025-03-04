import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import NotificationList from '../components/NotificationList';

const Notifications = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="mt-4 text-gray-600">Vous devez être connecté pour voir vos notifications.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Vos notifications</h1>
        <NotificationList />
      </div>
    </div>
  );
};

export default Notifications; 