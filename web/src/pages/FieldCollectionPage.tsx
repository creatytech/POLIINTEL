import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/auth.store';
import { useSurveyStore } from '../stores/survey.store';
import SurveyForm from '../components/survey/SurveyForm';
import OfflineIndicator from '../components/survey/OfflineIndicator';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

export default function FieldCollectionPage() {
  const { profile } = useAuthStore();
  const { activeFormId, activeCampaignId, setActiveForm, setDraft } = useSurveyStore();
  const [completed, setCompleted] = useState(false);

  const { data: assignments } = useQuery({
    queryKey: ['assignments', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      const { data } = await supabase
        .from('campaign_assignments')
        .select('*, campaigns(*), survey_forms(*)')
        .eq('collector_id', profile.id)
        .limit(10);
      return data ?? [];
    },
    enabled: !!profile?.id,
  });

  const { data: activeForm } = useQuery({
    queryKey: ['form', activeFormId],
    queryFn: async () => {
      if (!activeFormId) return null;
      const { data } = await supabase
        .from('survey_forms')
        .select('*')
        .eq('id', activeFormId)
        .single();
      return data;
    },
    enabled: !!activeFormId,
  });

  const startSurvey = (formId: string, campaignId: string) => {
    setActiveForm(formId, campaignId);
    setDraft({
      localId: crypto.randomUUID(),
      formId,
      campaignId,
      answers: {},
      startedAt: new Date().toISOString(),
    });
    setCompleted(false);
  };

  const handleComplete = () => {
    setCompleted(true);
  };

  if (completed) {
    return (
      <div className="max-w-xl mx-auto text-center py-12">
        <div className="text-6xl mb-4">✅</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Encuesta registrada!</h2>
        <p className="text-gray-500 mb-6">La respuesta se sincronizará automáticamente.</p>
        <Button onClick={() => setCompleted(false)}>Nueva encuesta</Button>
      </div>
    );
  }

  if (activeFormId && activeForm) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Recolección de Campo</h1>
        <SurveyForm
          formId={activeFormId}
          campaignId={activeCampaignId!}
          schema={activeForm.schema as Parameters<typeof SurveyForm>[0]['schema']}
          onComplete={handleComplete}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Recolección de Campo</h1>
      <OfflineIndicator />

      {assignments && assignments.length > 0 ? (
        <div className="space-y-4">
          {assignments.map((assignment) => (
            <Card key={assignment.id}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">
                    {(assignment.campaigns as { name: string } | null)?.name}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Cuota diaria: {assignment.daily_quota} · Recolectadas: {assignment.total_collected}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="info">{assignment.territory_level}</Badge>
                  <Button
                    size="sm"
                    onClick={() =>
                      startSurvey(
                        (assignment.survey_forms as { id: string } | null)?.id ?? '',
                        assignment.campaign_id,
                      )
                    }
                  >
                    Iniciar
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <p className="text-gray-500 text-center py-4">
            No tienes asignaciones activas en este momento.
          </p>
        </Card>
      )}
    </div>
  );
}
