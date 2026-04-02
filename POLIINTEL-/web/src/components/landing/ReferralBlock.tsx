// web/src/components/landing/ReferralBlock.tsx
import { useState }  from 'react';
import { Copy, Share2, Check } from 'lucide-react';
import type { Database } from '../../types/database';

type Initiative = Database['public']['Tables']['initiatives']['Row'];

interface Props {
  initiative: Initiative;
  refChannel: string;
}

function buildUrl(initiative: Initiative, ref: string) {
  const base = `${import.meta.env['VITE_APP_URL'] ?? window.location.origin}/${initiative.slug}`;
  return ref ? `${base}?ref=${encodeURIComponent(ref)}` : base;
}

export function ReferralBlock({ initiative, refChannel }: Props) {
  const [copied, setCopied] = useState(false);
  const url = buildUrl(initiative, refChannel);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback: select text
    }
  }

  async function share() {
    if (typeof navigator.share === 'function') {
      await navigator.share({
        title: initiative.title,
        text:  '¡Firma esta iniciativa!',
        url,
      });
    } else {
      await copy();
    }
  }

  return (
    <section className="py-14 px-4 bg-white">
      <div className="max-w-xl mx-auto text-center">
        <h3 className="text-xl font-bold text-slate-900 mb-2">
          Invita a más personas
        </h3>
        <p className="text-slate-500 text-sm mb-6">
          Comparte este enlace y suma firmas
        </p>

        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl p-3 mb-4">
          <span className="flex-1 text-sm text-slate-600 truncate text-left">{url}</span>
          <button
            onClick={copy}
            className="shrink-0 h-9 w-9 flex items-center justify-center rounded-lg
                       bg-white border border-slate-300 hover:bg-slate-100 transition-colors"
            title="Copiar"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4 text-slate-500" />}
          </button>
        </div>

        <button
          onClick={share}
          className="inline-flex items-center gap-2 py-3 px-8 rounded-full font-semibold
                     text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
          style={{ backgroundColor: initiative.brand_color ?? '#6366f1' }}
        >
          <Share2 className="h-4 w-4" />
          Compartir iniciativa
        </button>
      </div>
    </section>
  );
}
