// web/src/components/ui/NotificationBell.tsx
import { useEffect, useState } from 'react';
import { Bell }                from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase }            from '../../lib/supabase';
import { useAuthStore }        from '../../store/authStore';
import type { Database }       from '../../types/database';

type Notification = Database['public']['Tables']['notifications']['Row'];

export function NotificationBell() {
  const user = useAuthStore(s => s.user);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen]                   = useState(false);

  const unreadCount = notifications.filter(n => !n.read_at).length;

  useEffect(() => {
    if (!user) return;
    supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20)
      .then(({ data }) => setNotifications((data ?? []) as Notification[]));

    const channel = supabase
      .channel(`notifs-${user.id}`)
      .on('postgres_changes', {
        event:  'INSERT',
        schema: 'public',
        table:  'notifications',
        filter: `user_id=eq.${user.id}`,
      }, (payload) => {
        setNotifications(prev => [payload.new as Notification, ...prev].slice(0, 20));
      })
      .subscribe();

    return () => { void supabase.removeChannel(channel); };
  }, [user]);

  async function markAllRead() {
    if (!user) return;
    await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .is('read_at', null);
    setNotifications(prev => prev.map(n => ({ ...n, read_at: n.read_at ?? new Date().toISOString() })));
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="relative p-2 rounded-lg hover:bg-slate-100 text-slate-600"
        aria-label="Notificaciones"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-red-500
                       text-white text-[9px] font-bold flex items-center justify-center"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div
              className="fixed inset-0 z-30"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              className="absolute right-0 top-full mt-2 w-80 bg-white border border-slate-200
                         rounded-2xl shadow-xl z-40 overflow-hidden"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                <h3 className="font-semibold text-slate-900 text-sm">Notificaciones</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-xs text-indigo-600 hover:underline"
                  >
                    Marcar todo leído
                  </button>
                )}
              </div>
              <ul className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                {notifications.length === 0 && (
                  <li className="py-8 text-center text-slate-400 text-sm">Sin notificaciones</li>
                )}
                {notifications.map(n => (
                  <li
                    key={n.id}
                    className={`px-4 py-3 text-sm ${!n.read_at ? 'bg-indigo-50/50' : ''}`}
                  >
                    <p className="font-medium text-slate-800">{n.title}</p>
                    {n.body && <p className="text-slate-500 text-xs mt-0.5 line-clamp-2">{n.body}</p>}
                    <p className="text-slate-400 text-[10px] mt-1">
                      {n.created_at && new Date(n.created_at).toLocaleString('es-DO', {
                        day:    'numeric',
                        month:  'short',
                        hour:   '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </li>
                ))}
              </ul>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
