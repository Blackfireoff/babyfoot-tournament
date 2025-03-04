import React, { useState, useEffect } from 'react';
import { notificationService, teamService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const NotificationList = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const data = await notificationService.getUserNotifications(user.id);
        setNotifications(data);
        setError(null);
      } catch (err) {
        console.error('Erreur lors de la récupération des notifications:', err);
        setError('Impossible de charger les notifications');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
    
    // Rafraîchir les notifications toutes les 30 secondes
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const handleAcceptInvitation = async (notification) => {
    try {
      const notificationData = JSON.parse(notification.data);
      const playerId = notificationData.player_id;
      
      // Accepter l'invitation
      await teamService.respondToInvitation(playerId, true);
      
      // Marquer la notification comme lue
      await notificationService.markNotificationAsRead(notification.id);
      
      // Mettre à jour la liste des notifications
      setNotifications(notifications.filter(n => n.id !== notification.id));
    } catch (err) {
      console.error('Erreur lors de l\'acceptation de l\'invitation:', err);
      setError('Impossible d\'accepter l\'invitation');
    }
  };

  const handleDeclineInvitation = async (notification) => {
    try {
      const notificationData = JSON.parse(notification.data);
      const playerId = notificationData.player_id;
      
      // Refuser l'invitation
      await teamService.respondToInvitation(playerId, false);
      
      // Marquer la notification comme lue
      await notificationService.markNotificationAsRead(notification.id);
      
      // Mettre à jour la liste des notifications
      setNotifications(notifications.filter(n => n.id !== notification.id));
    } catch (err) {
      console.error('Erreur lors du refus de l\'invitation:', err);
      setError('Impossible de refuser l\'invitation');
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationService.markNotificationAsRead(notificationId);
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, is_read: true } : n
      ));
    } catch (err) {
      console.error('Erreur lors du marquage de la notification comme lue:', err);
      setError('Impossible de marquer la notification comme lue');
    }
  };

  if (loading) {
    return <div className="text-center py-4">Chargement des notifications...</div>;
  }

  if (error) {
    return <div className="text-center py-4 text-red-600">{error}</div>;
  }

  if (notifications.length === 0) {
    return <div className="text-center py-4 text-gray-500">Aucune notification</div>;
  }

  return (
    <div className="space-y-4">
      {notifications.map((notification) => (
        <div 
          key={notification.id} 
          className={`p-4 border rounded-lg shadow-sm ${notification.is_read ? 'bg-gray-50' : 'bg-white border-blue-200'}`}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="font-medium">{notification.content}</p>
              <p className="text-sm text-gray-500">
                {new Date(notification.created_at).toLocaleString()}
              </p>
            </div>
            {!notification.is_read && (
              <button 
                onClick={() => handleMarkAsRead(notification.id)}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Marquer comme lu
              </button>
            )}
          </div>
          
          {notification.type === 'team_invitation' && !notification.is_read && (
            <div className="mt-3 flex space-x-2">
              <button
                onClick={() => handleAcceptInvitation(notification)}
                className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
              >
                Accepter
              </button>
              <button
                onClick={() => handleDeclineInvitation(notification)}
                className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
              >
                Refuser
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default NotificationList; 