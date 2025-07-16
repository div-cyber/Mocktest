import React, { useState } from 'react';
import { Bell, Check, X, Clock, Trophy, BookOpen, MessageCircle, User, CheckCircle, AlertCircle, Info, Trash2, AreaChart as MarkAsUnread } from 'lucide-react';

interface Notification {
  id: string;
  type: 'test' | 'note' | 'message' | 'system' | 'achievement';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
  actionUrl?: string;
}

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'test',
      title: 'New Mock Test Available',
      message: 'Engineering Mathematics Mock Test 2 is now available for practice.',
      timestamp: '2025-01-15T10:30:00Z',
      read: false,
      priority: 'high'
    },
    {
      id: '2',
      type: 'achievement',
      title: 'Achievement Unlocked!',
      message: 'Congratulations! You\'ve completed 10 mock tests and earned the "Dedicated Learner" badge.',
      timestamp: '2025-01-15T09:15:00Z',
      read: false,
      priority: 'medium'
    },
    {
      id: '3',
      type: 'note',
      title: 'New Study Notes Uploaded',
      message: 'Data Structures and Algorithms - Advanced Topics notes have been uploaded by Admin.',
      timestamp: '2025-01-14T16:45:00Z',
      read: true,
      priority: 'medium'
    },
    {
      id: '4',
      type: 'message',
      title: 'New Chat Message',
      message: 'Sarah Wilson replied to your question in the Engineering chat.',
      timestamp: '2025-01-14T14:20:00Z',
      read: true,
      priority: 'low'
    },
    {
      id: '5',
      type: 'system',
      title: 'Weekly Progress Report',
      message: 'Your weekly progress report is ready. You\'ve improved by 15% this week!',
      timestamp: '2025-01-14T08:00:00Z',
      read: false,
      priority: 'medium'
    },
    {
      id: '6',
      type: 'test',
      title: 'Test Reminder',
      message: 'Don\'t forget to complete the Physics Mock Test. It expires in 2 days.',
      timestamp: '2025-01-13T12:00:00Z',
      read: true,
      priority: 'high'
    }
  ]);

  const [filter, setFilter] = useState<'all' | 'unread' | 'test' | 'note' | 'message' | 'system' | 'achievement'>('all');

  const getIcon = (type: string) => {
    switch (type) {
      case 'test': return Trophy;
      case 'note': return BookOpen;
      case 'message': return MessageCircle;
      case 'achievement': return CheckCircle;
      case 'system': return Info;
      default: return Bell;
    }
  };

  const getIconColor = (type: string, priority: string) => {
    if (priority === 'high') return 'text-red-600 bg-red-100';
    switch (type) {
      case 'test': return 'text-blue-600 bg-blue-100';
      case 'note': return 'text-green-600 bg-green-100';
      case 'message': return 'text-purple-600 bg-purple-100';
      case 'achievement': return 'text-yellow-600 bg-yellow-100';
      case 'system': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  const markAsUnread = (id: string) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, read: false } : notif
    ));
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter(notif => notif.id !== id));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, read: true })));
  };

  const clearAll = () => {
    if (confirm('Are you sure you want to clear all notifications?')) {
      setNotifications([]);
    }
  };

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notif.read;
    return notif.type === filter;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-black rounded-xl shadow-lg text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Notifications</h1>
            <p className="text-gray-300">Stay updated with your latest activities</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">{unreadCount}</p>
            <p className="text-sm text-gray-300">Unread</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'All', count: notifications.length },
              { key: 'unread', label: 'Unread', count: unreadCount },
              { key: 'test', label: 'Tests', count: notifications.filter(n => n.type === 'test').length },
              { key: 'note', label: 'Notes', count: notifications.filter(n => n.type === 'note').length },
              { key: 'message', label: 'Messages', count: notifications.filter(n => n.type === 'message').length },
              { key: 'achievement', label: 'Achievements', count: notifications.filter(n => n.type === 'achievement').length }
            ].map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setFilter(key as any)}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  filter === key
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {label} {count > 0 && `(${count})`}
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex space-x-2">
            <button
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
              className="flex items-center px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Check className="h-4 w-4 mr-1" />
              Mark All Read
            </button>
            <button
              onClick={clearAll}
              disabled={notifications.length === 0}
              className="flex items-center px-3 py-2 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Clear All
            </button>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
            <p className="text-gray-500">
              {filter === 'unread' 
                ? "You're all caught up! No unread notifications."
                : "You don't have any notifications yet."
              }
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => {
            const Icon = getIcon(notification.type);
            const iconColor = getIconColor(notification.type, notification.priority);
            
            return (
              <div
                key={notification.id}
                className={`bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow ${
                  !notification.read ? 'border-l-4 border-l-black' : ''
                }`}
              >
                <div className="flex items-start space-x-4">
                  {/* Icon */}
                  <div className={`p-2 rounded-lg ${iconColor} flex-shrink-0`}>
                    <Icon className="h-5 w-5" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className={`text-sm font-medium ${
                          !notification.read ? 'text-gray-900' : 'text-gray-700'
                        }`}>
                          {notification.title}
                        </h3>
                        <p className={`text-sm mt-1 ${
                          !notification.read ? 'text-gray-700' : 'text-gray-500'
                        }`}>
                          {notification.message}
                        </p>
                        <div className="flex items-center mt-2 space-x-4">
                          <span className="text-xs text-gray-500 flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatTime(notification.timestamp)}
                          </span>
                          {notification.priority === 'high' && (
                            <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                              High Priority
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2 ml-4">
                        {!notification.read ? (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                            title="Mark as read"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => markAsUnread(notification.id)}
                            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                            title="Mark as unread"
                          >
                            <MarkAsUnread className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete notification"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Quick Stats */}
      {notifications.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { type: 'test', label: 'Tests', icon: Trophy, color: 'text-blue-600' },
              { type: 'note', label: 'Notes', icon: BookOpen, color: 'text-green-600' },
              { type: 'message', label: 'Messages', icon: MessageCircle, color: 'text-purple-600' },
              { type: 'achievement', label: 'Achievements', icon: CheckCircle, color: 'text-yellow-600' },
              { type: 'system', label: 'System', icon: Info, color: 'text-gray-600' }
            ].map(({ type, label, icon: Icon, color }) => {
              const count = notifications.filter(n => n.type === type).length;
              return (
                <div key={type} className="text-center">
                  <Icon className={`h-8 w-8 mx-auto mb-2 ${color}`} />
                  <p className="text-2xl font-bold text-gray-900">{count}</p>
                  <p className="text-sm text-gray-500">{label}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;