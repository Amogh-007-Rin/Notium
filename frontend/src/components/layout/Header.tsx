import { Bell, ChevronRight } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Profitability Overview',
  '/forecast': 'Profit Forecast',
  '/explainer': 'Profit Change Analysis',
  '/risk': 'Product Risk Matrix',
  '/simulator': 'What-If Scenario Simulator',
  '/settings': 'Settings & Data Management',
};

export function Header({ dataFreshness }: { dataFreshness?: string }) {
  const location = useLocation();
  const { activeNotifications, markAllRead } = useUIStore();
  const { user } = useAuthStore();
  const [notifOpen, setNotifOpen] = useState(false);
  const unread = activeNotifications.filter((n) => !n.read).length;
  const title = PAGE_TITLES[location.pathname] ?? 'Notium PIP';

  return (
    <header
      className="flex items-center justify-between px-6 shrink-0"
      style={{
        height: 56,
        background: 'var(--bg-base)',
        borderBottom: '1px solid var(--border-subtle)',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}
    >
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Notium PIP
        </span>
        <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />
        <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
          {title}
        </span>
      </div>

      {/* Center: data freshness */}
      {dataFreshness && (
        <div className="hidden md:flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: 'var(--success)', boxShadow: '0 0 6px var(--success)' }} />
          <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
            {dataFreshness}
          </span>
        </div>
      )}

      {/* Right: notifications + user */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <button
            onClick={() => { setNotifOpen(!notifOpen); if (notifOpen) markAllRead(); }}
            className="relative p-2 rounded-lg transition-colors"
            style={{ color: 'var(--text-secondary)' }}
          >
            <Bell size={18} />
            {unread > 0 && (
              <span
                className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-xs flex items-center justify-center font-mono"
                style={{ background: 'var(--danger)', color: '#fff', fontSize: 10 }}
              >
                {unread}
              </span>
            )}
          </button>

          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="glass absolute right-0 mt-2 rounded-lg shadow-xl overflow-hidden"
                style={{ width: 300, top: '100%', zIndex: 50 }}
              >
                <div className="px-3 py-2.5" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                    Notifications
                  </span>
                </div>
                {activeNotifications.length === 0 ? (
                  <div className="px-4 py-6 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                    No notifications
                  </div>
                ) : (
                  activeNotifications.slice(0, 5).map((n) => (
                    <div
                      key={n.id}
                      className="px-3 py-2.5 text-sm"
                      style={{
                        borderBottom: '1px solid var(--border-subtle)',
                        color: n.read ? 'var(--text-muted)' : 'var(--text-primary)',
                        background: n.read ? 'transparent' : 'var(--brand-dim)',
                      }}
                    >
                      {n.message}
                    </div>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {user && (
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: 'var(--brand-dim)', color: 'var(--brand-primary)' }}
            >
              {user.name.charAt(0)}
            </div>
            <div className="hidden md:block">
              <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
                {user.name}
              </p>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
