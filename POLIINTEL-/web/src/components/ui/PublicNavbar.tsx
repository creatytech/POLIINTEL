// web/src/components/ui/PublicNavbar.tsx
import { useState }            from 'react';
import { Link }                from 'react-router-dom';
import { Menu, X, WifiOff }    from 'lucide-react';
import { useSyncStore }        from '../../store/syncStore';

interface Props {
  title:      string;
  slug:       string;
  color?:     string;
  logoUrl?:   string | null;
}

export function PublicNavbar({ title, slug, color = '#6366f1', logoUrl }: Props) {
  const [open, setOpen]  = useState(false);
  const isOnline         = useSyncStore(s => s.isOnline);

  const navLinks = [
    { label: 'Inicio',         href: `/${slug}` },
    { label: 'Firmar',         href: `/${slug}#firmar` },
    { label: 'Avances',        href: `/${slug}?mode=progress` },
    { label: 'Transparencia',  href: `/${slug}?mode=transparency` },
  ];

  return (
    <nav
      className="sticky top-0 z-50 bg-white shadow-sm border-b border-slate-100"
    >
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        {/* Brand */}
        <Link to={`/${slug}`} className="flex items-center gap-2 shrink-0">
          {logoUrl ? (
            <img src={logoUrl} alt={title} className="h-8 w-auto object-contain" />
          ) : (
            <span
              className="font-extrabold text-lg tracking-tight"
              style={{ color }}
            >
              {title.length > 24 ? title.slice(0, 22) + '…' : title}
            </span>
          )}
        </Link>

        {/* Offline badge */}
        {!isOnline && (
          <span className="flex items-center gap-1 text-amber-600 text-xs font-medium
                           bg-amber-50 px-2 py-1 rounded-full">
            <WifiOff className="h-3 w-3" />
            Offline
          </span>
        )}

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-6 ml-auto">
          {navLinks.map(l => (
            <li key={l.href}>
              <a
                href={l.href}
                className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                {l.label}
              </a>
            </li>
          ))}
          <li>
            <a
              href={`/${slug}#firmar`}
              className="py-2 px-5 rounded-full text-white text-sm font-semibold
                         hover:opacity-90 transition-opacity"
              style={{ backgroundColor: color }}
            >
              Firmar ahora
            </a>
          </li>
        </ul>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-slate-100"
          onClick={() => setOpen(v => !v)}
          aria-label="Menú"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden bg-white border-t border-slate-100 px-4 pb-4">
          <ul className="space-y-2 pt-3">
            {navLinks.map(l => (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block py-2.5 px-3 rounded-lg text-sm font-medium text-slate-700
                             hover:bg-slate-50"
                >
                  {l.label}
                </a>
              </li>
            ))}
            <li>
              <a
                href={`/${slug}#firmar`}
                className="block py-3 rounded-full text-white font-semibold text-sm text-center
                           hover:opacity-90"
                style={{ backgroundColor: color }}
                onClick={() => setOpen(false)}
              >
                Firmar ahora
              </a>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
}
