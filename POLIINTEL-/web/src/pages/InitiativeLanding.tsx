// web/src/pages/InitiativeLanding.tsx
import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { supabase, subscribeToInitiativeCount } from '../lib/supabase';
import { getCachedInitiative, cacheInitiative } from '../lib/db';
import { HeroBlock }        from '../components/landing/HeroBlock';
import { SignatureForm }     from '../components/landing/SignatureForm';
import { MilestoneTracker } from '../components/landing/MilestoneTracker';
import { KpiStrip }         from '../components/landing/KpiStrip';
import { SupportersWall }   from '../components/landing/SupportersWall';
import { ReferralBlock }    from '../components/landing/ReferralBlock';
import { TransparencyBlock } from '../components/landing/TransparencyBlock';
import { PublicNavbar }     from '../components/ui/PublicNavbar';
import { Footer }           from '../components/ui/Footer';
import type { Database }    from '../types/database';

type Initiative = Database['public']['Tables']['initiatives']['Row'];
type Block = {
  type:    string;
  enabled: boolean;
  order:   number;
  config?: Record<string, unknown>;
};

interface Props {
  mode?: 'sign' | 'progress' | 'map' | 'results' | 'press' | 'transparency' | 'faq';
}

const defaultBlocks: Block[] = [
  { type: 'hero',           enabled: true, order: 0 },
  { type: 'kpis',           enabled: true, order: 1 },
  { type: 'signature_form', enabled: true, order: 2 },
  { type: 'milestone',      enabled: true, order: 3 },
  { type: 'supporters',     enabled: true, order: 4 },
  { type: 'referral',       enabled: true, order: 5 },
  { type: 'transparency',   enabled: true, order: 6 },
];

interface BlockContext {
  initiative: Initiative & { goals?: unknown[]; milestones?: unknown[]; candidates?: unknown[] };
  liveCount:  number;
  todayCount: number;
  avgPerHour: number;
  mode:       string;
  refChannel: string;
  pct:        string;
}

export default function InitiativeLanding({ mode = 'sign' }: Props) {
  const { slug }           = useParams<{ slug: string }>();
  const [searchParams]     = useSearchParams();
  const { t }              = useTranslation();
  const refChannel         = searchParams.get('ref') ?? 'direct';
  const [liveCount, setLiveCount] = useState(0);

  const { data: initiative, isLoading, isError } = useQuery({
    queryKey: ['initiative', slug],
    queryFn:  async () => {
      const { data, error } = await supabase
        .from('initiatives')
        .select('*, goals(*), milestones(*), candidates(*)')
        .eq('slug', slug!)
        .eq('published', true)
        .single();

      if (error) {
        const cached = await getCachedInitiative(slug!);
        if (cached) return cached as Initiative;
        throw error;
      }
      await cacheInitiative(slug!, data);
      return data;
    },
    staleTime: 60_000,
    retry:     1,
  });

  const { data: countData } = useQuery({
    queryKey: ['initiative-count', (initiative as Record<string, unknown>)?.['id']],
    queryFn:  async () => {
      const id = (initiative as Record<string, unknown>)?.['id'] as string;
      const { data } = await supabase
        .from('mv_initiative_counts')
        .select('total_signatures, today_signatures, avg_per_hour')
        .eq('initiative_id', id)
        .single();
      return data;
    },
    enabled:   !!(initiative as Record<string, unknown>)?.['id'],
    staleTime: 30_000,
  });

  useEffect(() => {
    const id = (initiative as Record<string, unknown>)?.['id'] as string | undefined;
    if (!id) return;
    setLiveCount((countData?.total_signatures as number) ?? 0);
    const unsub = subscribeToInitiativeCount(id, () => setLiveCount(prev => prev + 1));
    return () => { unsub(); };
  }, [(initiative as Record<string, unknown>)?.['id'], countData?.total_signatures]);

  const blocks: Block[] = ((initiative as Record<string, unknown>)?.['brand_json'] as Record<string, unknown>)?.['blocks'] as Block[] ?? defaultBlocks;
  const appUrl  = (import.meta.env['VITE_APP_URL'] as string) ?? '';
  const goal    = ((initiative as Record<string, unknown>)?.['goals'] as { target_value: number }[] | undefined)?.[0]?.target_value ?? 0;
  const pct     = goal > 0 ? ((liveCount / goal) * 100).toFixed(1) : '0';

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500" />
    </div>
  );

  if (isError || !initiative) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white gap-4">
      <h1 className="text-2xl font-bold">{t('common.error')}</h1>
      <p className="text-slate-400">La iniciativa no está disponible.</p>
    </div>
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ini = initiative as Initiative & { goals?: any[]; milestones?: any[]; candidates?: any[] };
  const ctx: BlockContext = {
    initiative: ini,
    liveCount,
    todayCount:  (countData?.today_signatures as number) ?? 0,
    avgPerHour:  (countData?.avg_per_hour as number) ?? 0,
    mode,
    refChannel,
    pct,
  };

  return (
    <>
      <Helmet>
        <title>{ini.title} — POLIINTEL</title>
        <meta name="description" content={ini.description ?? ''} />
        <meta property="og:title"       content={ini.title} />
        <meta property="og:description" content={ini.description ?? ''} />
        <meta property="og:type"        content="website" />
        <meta property="og:url"         content={`${appUrl}/${slug}`} />
        <meta name="twitter:card"       content="summary_large_image" />
        <link rel="canonical"           href={`${appUrl}/${slug}`} />
      </Helmet>

      <PublicNavbar
        title={ini.title}
        color={ini.brand_color ?? '#1a1a2e'}
        logoUrl={ini.logo_url ?? undefined}
        slug={slug!}
      />

      <main>
        {blocks
          .filter(b => b.enabled)
          .sort((a, b) => a.order - b.order)
          .map(block => {
            switch (block.type) {
              case 'hero':
                return <HeroBlock key="hero" initiative={ini} liveCount={liveCount} pct={parseFloat(pct)} config={block.config} />;
              case 'signature_form':
                return <SignatureForm key="signature_form" initiative={ini as unknown as Initiative} refChannel={refChannel} mode={ctx.mode} />;
              case 'milestone':
                return <MilestoneTracker key="milestone" milestones={(ini.milestones ?? []) as unknown as import('@/types/database').Database['public']['Tables']['milestones']['Row'][]} currentCount={liveCount} />;
              case 'kpis':
                return <KpiStrip key="kpis" total={liveCount} today={ctx.todayCount} avgPerHour={ctx.avgPerHour} />;
              case 'supporters':
                return <SupportersWall key="supporters" initiativeId={ini.id} />;
              case 'referral':
                return <ReferralBlock key="referral" initiative={ini} refChannel={refChannel} />;
              case 'transparency':
                return <TransparencyBlock key="transparency" initiative={ini} />;
              default:
                return null;
            }
          })}
      </main>

      <Footer />
    </>
  );
}
