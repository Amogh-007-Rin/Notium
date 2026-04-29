import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  TrendingUp,
  MessageSquare,
  Shield,
  FlaskConical,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';
import Logo from '../logo/Logo';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/forecast', label: 'Forecast', icon: TrendingUp },
  { path: '/explainer', label: 'Explainer', icon: MessageSquare },
  { path: '/risk', label: 'Risk Matrix', icon: Shield },
  { path: '/simulator', label: 'What-If Simulator', icon: FlaskConical },
];

const FINANCE_ONLY = [
  { path: '/settings', label: 'Settings / Data', icon: Settings },
];

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const width = sidebarCollapsed ? 64 : 240;
  const showSettings = user?.role === 'finance_team';

  const handleLogout = () => {
    logout();
    toast.success('Signed out successfully');
    navigate('/login');
  };

  const allItems = showSettings ? [...NAV_ITEMS, ...FINANCE_ONLY] : NAV_ITEMS;

  return (
    <motion.aside
      animate={{ width }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col h-full shrink-0 overflow-hidden"
      style={{
        background: 'var(--bg-base)',
        borderRight: '1px solid var(--border-subtle)',
        position: 'relative',
        zIndex: 20,
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center px-4 py-5 shrink-0"
        style={{ height: 56, borderBottom: '1px solid var(--border-subtle)' }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <Logo></Logo>
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col min-w-0"
              >
                <span className="text-xl mx-2 font-semibold tracking-tight truncate" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                  Notium
                </span>
                <span className="text-xs mx-2 font-mono" style={{ color: 'var(--brand-primary)', letterSpacing: '0.1em' }}>
                  PIP
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-3 overflow-y-auto overflow-x-hidden">
        {allItems.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            title={sidebarCollapsed ? label : undefined}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-all duration-200 relative group ${
                isActive ? 'text-brand-primary' : ''
              }`
            }
            style={({ isActive }) => ({
              background: isActive ? 'var(--brand-dim)' : 'transparent',
              color: isActive ? 'var(--brand-primary)' : 'var(--text-secondary)',
              borderLeft: isActive ? '3px solid var(--brand-primary)' : '3px solid transparent',
            })}
          >
            {({ isActive }) => (
              <>
                <Icon size={18} className="shrink-0" />
                <AnimatePresence>
                  {!sidebarCollapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-sm font-medium truncate"
                    >
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {/* Tooltip when collapsed */}
                {sidebarCollapsed && (
                  <div
                    className="absolute left-full ml-3 px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50"
                    style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border-default)' }}
                  >
                    {label}
                  </div>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div style={{ borderTop: '1px solid var(--border-subtle)', padding: '12px 8px' }}>
        {user && (
          <div className="flex items-center gap-3 px-2 py-2 mb-1 overflow-hidden">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold"
              style={{ background: 'var(--brand-dim)', color: 'var(--brand-primary)' }}
            >
              {user.name.charAt(0)}
            </div>
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="min-w-0"
                >
                  <p className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                    {user.name}
                  </p>
                  <p className="text-xs truncate font-mono" style={{ color: 'var(--text-muted)', fontSize: 10 }}>
                    {user.role.replace('_', ' ')}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
        <button
          onClick={handleLogout}
          title={sidebarCollapsed ? 'Sign Out' : undefined}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg transition-colors text-sm group"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--danger)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
        >
          <LogOut size={16} className="shrink-0" />
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                Sign Out
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  );
}
