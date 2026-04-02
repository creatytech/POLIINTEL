// web/src/components/layout/AdminLayout.tsx
import { useState, useEffect }         from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FileText, Users, BarChart2, Network,
  Settings, LogOut, ChevronLeft, ChevronRight, Menu, WifiOff,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { NotificationBell }        from '../../components/ui/NotificationBell';
import { useAuthStore }            from '../../store/authStore';
import { useSyncStore }            from '../../store/syncStore';

interface NavItem {
  to:    string;
  icon:  React.ReactNode;
  label: string;
  minLevel?: number;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/admin',                icon: <LayoutDashboard className="h-5 w-5" />, label: 'Dashboard' },
  { to: '/admin/initiatives',    icon: <FileText        className="h-5 w-5" />, label: 'Iniciativas' },
  { to: '/admin/candidates',     icon: <Users           className="h-5 w-5" />, label: 'Candidatos' },
  { to: '/admin/predictions',    icon: <BarChart2       className="h-5 w-5" />, label: 'Predicciones', minLevel: 4 },
  { to: '/admin/pyramid',        icon: <Network         className="h-5 w-5" />, label: 'Pirámide org.', minLevel: 3 },
  { to: '/admin/settings',       icon: <Settings        className="h-5 w-5" />, label: 'Ajustes',       minLevel: 6 },
];

export default function AdminLayout() {
  const [collapsed, setCollapsed]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location                    = useLocation();
  const navigate                    = useNavigate();
  const { user, userLevel, signOut } = useAuthStore();
  const { isOnline, pendingCount }  = useSyncStore();

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const visibleItems = NAV_ITEMS.filter(
    item => !item.minLevel || (userLevel ?? 0) >= item.minLevel,
  );

  async function handleSignOut() {
    await signOut();
    navigate('/admin/login');
  }

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <aside
      className={`flex flex-col h-full bg-slate-900 text-white transition-all duration-200
        ${mobile ? 'w-64' : collapsed ? 'w-16' : 'w-64'}`}
    >
      {/* Logo */}
      <div className={`flex items-center gap-2 px-4 h-14 border-b border-white/10
        ${collapsed && !mobile ? 'justify-center' : ''}`}>
        <span className="h-7 w-7 rounded-lg bg-indigo-500 flex items-center justify-center
                         text-white font-extrabold text-xs shrink-0">P</span>
        {(!collapsed || mobile) && (
          <span className="font-bold text-sm tracking-tight">POLIINTEL</span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 space-y-1 px-2">
        {visibleItems.map(item => {
          const active = location.pathname === item.to ||
            (item.to !== '/admin' && location.pathname.startsWith(item.to));
          return (
            <Link
              key={item.to}
              to={item.to}
              title={collapsed && !mobile ? item.label : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                transition-colors
                ${active
                  ? 'bg-indigo-600 text-white'
                  : 'text-white/60 hover:bg-white/10 hover:text-white'}`}
            >
              <span className="shrink-0">{item.icon}</span>
              {(!collapsed || mobile) && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Offline / Pending */}
      {!isOnline && (!collapsed || mobile) && (
        <div className="mx-3 mb-2 bg-amber-500/20 border border-amber-400/30 rounded-xl px-3 py-2">
          <div className="flex items-center gap-2 text-amber-300 text-xs font-medium">
            <WifiOff className="h-3.5 w-3.5" />
            Offline · {pendingCount} pendientes
          </div>
        </div>
      )}

      {/* User + sign-out */}
      <div className={`border-t border-white/10 p-3 flex items-center gap-3
        ${collapsed && !mobile ? 'justify-center' : ''}`}>
        <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center
                        text-xs font-bold shrink-0">
          {user?.email?.[0]?.toUpperCase() ?? 'U'}
        </div>
        {(!collapsed || mobile) && (
          <>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white truncate">{user?.email}</p>
              <p className="text-[10px] text-white/40">Nivel {userLevel}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10"
              title="Cerrar sesión"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </>
        )}
      </div>

      {/* Collapse toggle (desktop only) */}
      {!mobile && (
        <button
          onClick={() => setCollapsed(v => !v)}
          className="absolute -right-3 top-1/2 -translate-y-1/2 h-6 w-6 bg-slate-700
                     border border-slate-600 rounded-full flex items-center justify-center
                     text-white/60 hover:text-white shadow-md"
        >
          {collapsed
            ? <ChevronRight className="h-3 w-3" />
            : <ChevronLeft  className="h-3 w-3" />}
        </button>
      )}
    </aside>
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Desktop sidebar */}
      <div className="relative hidden md:flex flex-col h-full">
        <Sidebar />
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/60 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              className="fixed left-0 top-0 bottom-0 z-50 md:hidden"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
            >
              <Sidebar mobile />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-14 bg-white border-b border-slate-200 flex items-center px-4 gap-3 shrink-0">
          <button
            onClick={() => setMobileOpen(true)}
            className="md:hidden p-2 rounded-lg hover:bg-slate-100"
          >
            <Menu className="h-5 w-5 text-slate-600" />
          </button>
          <div className="flex-1" />
          <NotificationBell />
          {!isOnline && (
            <span className="flex items-center gap-1 text-amber-600 text-xs font-medium
                             bg-amber-50 px-2 py-1 rounded-full">
              <WifiOff className="h-3 w-3" />
              Offline
            </span>
          )}
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
