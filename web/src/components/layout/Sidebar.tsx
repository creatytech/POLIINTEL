import { NavLink } from 'react-router-dom';
import clsx from 'clsx';
import { useAuthStore } from '../../stores/auth.store';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/field', label: 'Recolección', icon: '📋' },
  { to: '/analytics', label: 'Analítica', icon: '📈' },
  { to: '/map', label: 'Mapa', icon: '🗺️' },
  { to: '/admin', label: 'Administración', icon: '⚙️', adminOnly: true },
];

export default function Sidebar() {
  const { profile } = useAuthStore();

  const visibleItems = navItems.filter(
    (item) => !item.adminOnly || profile?.role === 'org_admin' || profile?.role === 'super_admin',
  );

  return (
    <aside className="w-64 bg-blue-900 text-white flex flex-col flex-shrink-0">
      <div className="p-6 border-b border-blue-800">
        <h1 className="text-xl font-bold tracking-tight">POLIINTEL</h1>
        <p className="text-blue-300 text-xs mt-1">Inteligencia Electoral</p>
      </div>
      <nav className="flex-1 py-4">
        {visibleItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-6 py-3 text-sm transition-colors',
                isActive
                  ? 'bg-blue-800 text-white font-medium'
                  : 'text-blue-200 hover:bg-blue-800 hover:text-white',
              )
            }
          >
            <span className="text-lg">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-blue-800">
        <p className="text-blue-300 text-xs truncate">{profile?.full_name ?? profile?.email}</p>
        <p className="text-blue-400 text-xs">{profile?.role}</p>
      </div>
    </aside>
  );
}
