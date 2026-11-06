import React, { useState, useEffect } from 'react';
import { Bell, X, CheckCheck, Info, AlertTriangle, CheckCircle, AlertCircle, Trash2 } from 'lucide-react';
import { getAbsoluteApiUrl } from '../services/apiConfig';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  target: string;
  type: 'info' | 'success' | 'warning' | 'alert';
  sender: string;
  createdAt: string;
  readBy?: string[];
}

interface NotificationsPopoverProps {
  userEmail: string;
  isOpen: boolean;
  onClose: () => void;
  onUnreadCountChange?: (count: number) => void;
}

export const NotificationsPopover: React.FC<NotificationsPopoverProps> = ({
  userEmail,
  isOpen,
  onClose,
  onUnreadCountChange,
}) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    if (!userEmail) return;
    setLoading(true);
    try {
      const res = await fetch(
        getAbsoluteApiUrl(`/api/notifications?userEmail=${encodeURIComponent(userEmail)}`),
        {
          headers: {
            'x-user-email': userEmail,
          },
        }
      );
      if (res.ok) {
        const text = await res.text();
        let data: NotificationItem[] = [];
        try {
          data = JSON.parse(text);
        } catch (parseErr) {
          data = [];
        }
        setNotifications(data);
        const unread = data.filter((n) => !n.readBy || !n.readBy.includes(userEmail)).length;
        if (onUnreadCountChange) onUnreadCountChange(unread);
      }
    } catch (err) {
      console.warn('Bildirishnomalarni yuklashda xatolik:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Refresh notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [userEmail]);

  const markAsRead = async (notifId: string) => {
    try {
      await fetch(getAbsoluteApiUrl('/api/notifications/mark-read'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId: notifId, userEmail }),
      });

      setNotifications((prev) =>
        prev.map((n) => {
          if (n.id === notifId) {
            const updatedReadBy = n.readBy ? [...n.readBy] : [];
            if (!updatedReadBy.includes(userEmail)) updatedReadBy.push(userEmail);
            return { ...n, readBy: updatedReadBy };
          }
          return n;
        })
      );

      const remainingUnread = notifications.filter((n) =>
        n.id === notifId ? false : !n.readBy || !n.readBy.includes(userEmail)
      ).length;
      if (onUnreadCountChange) onUnreadCountChange(remainingUnread);
    } catch (err) {
      console.error('O\'qilgan deb belgilashda xatolik:', err);
    }
  };

  const markAllAsRead = async () => {
    for (const notif of notifications) {
      if (!notif.readBy || !notif.readBy.includes(userEmail)) {
        await markAsRead(notif.id);
      }
    }
  };

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.readBy || !n.readBy.includes(userEmail)).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="text-emerald-500" size={18} />;
      case 'warning':
        return <AlertTriangle className="text-amber-500" size={18} />;
      case 'alert':
        return <AlertCircle className="text-red-500" size={18} />;
      default:
        return <Info className="text-blue-500" size={18} />;
    }
  };

  return (
    <div className="absolute right-0 top-14 w-80 sm:w-96 bg-white border border-slate-200 rounded-3xl shadow-2xl z-50 overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell size={18} className="text-blue-400" />
          <h4 className="text-xs font-black uppercase tracking-wider">Bildirishnomalar</h4>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              {unreadCount} yangi
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-[10px] text-slate-300 hover:text-white flex items-center gap-1 bg-white/10 px-2 py-1 rounded-lg transition-all"
              title="Barchasini o'qildi deb belgilash"
            >
              <CheckCheck size={14} />
              <span>Barchasi o'qildi</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-lg text-slate-300 transition-all"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="max-h-96 overflow-y-auto divide-y divide-slate-100 p-2">
        {loading && notifications.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 font-bold">Yuklanmoqda...</div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 font-bold space-y-1">
            <p>Hozircha bildirishnomalar yo'q</p>
            <p className="text-[10px] text-slate-300">Admin xabarlari shu yerda ko'rinadi</p>
          </div>
        ) : (
          notifications.map((notif) => {
            const isUnread = !notif.readBy || !notif.readBy.includes(userEmail);
            return (
              <div
                key={notif.id}
                className={`p-3.5 rounded-2xl transition-all flex items-start gap-3 my-1 ${
                  isUnread ? 'bg-blue-50/70 border border-blue-100' : 'bg-slate-50/50 hover:bg-slate-50'
                }`}
              >
                <div className="mt-0.5 flex-shrink-0">{getIcon(notif.type)}</div>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h5 className="text-xs font-bold text-slate-900 leading-tight">{notif.title}</h5>
                    <span className="text-[9px] text-slate-400 font-medium whitespace-nowrap">
                      {new Date(notif.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-snug">{notif.message}</p>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[9px] font-bold text-slate-400">
                      Kimdan: {notif.sender || 'Admin'}
                    </span>

                    {isUnread && (
                      <button
                        onClick={() => markAsRead(notif.id)}
                        className="text-[10px] font-bold text-blue-600 hover:text-blue-800 bg-white px-2 py-0.5 rounded-md border border-blue-200 transition-all shadow-2xs"
                      >
                        O'qildi deb belgilash
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
