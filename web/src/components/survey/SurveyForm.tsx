import { useState } from 'react';
import { useSurveyStore } from '../../stores/survey.store';
import { queueResponse } from '../../lib/sync-engine';
import { useGeoLocation } from '../../hooks/useGeoLocation';
import { Button } from '../ui/Button';
import QuestionRenderer from './QuestionRenderer';
import OfflineIndicator from './OfflineIndicator';
import { useAuthStore } from '../../stores/auth.store';

interface SurveySection {
  id: string;
  title: string;
  questions: Array<{
    id: string;
    type: string;
    text: string;
    required?: boolean;
    options?: Array<{ value: string; label: string }>;
    min?: number;
    max?: number;
  }>;
}

interface SurveyFormSchema {
  sections: SurveySection[];
  settings?: { allow_gps?: boolean; require_photo?: boolean };
}

interface SurveyFormProps {
  formId: string;
  campaignId: string;
  schema: SurveyFormSchema;
  onComplete?: () => void;
}

export default function SurveyForm({ formId, campaignId, schema, onComplete }: SurveyFormProps) {
  const { profile } = useAuthStore();
  const { draft, currentSectionIndex, updateAnswer, setSection, resetSurvey } = useSurveyStore();
  const { position, getPosition } = useGeoLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sections = schema.sections;
  const currentSection = sections[currentSectionIndex];
  const isLastSection = currentSectionIndex === sections.length - 1;

  const handleAnswer = (questionId: string, value: unknown) => {
    updateAnswer(questionId, value);
  };

  const handleNext = () => {
    if (!isLastSection) {
      setSection(currentSectionIndex + 1);
    }
  };

  const handleBack = () => {
    if (currentSectionIndex > 0) {
      setSection(currentSectionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    if (!profile || !draft) return;
    setIsSubmitting(true);

    try {
      if (schema.settings?.allow_gps && !position) {
        getPosition();
      }

      await queueResponse({
        localId: draft.localId,
        formId,
        campaignId,
        collectorId: profile.id,
        lat: position?.lat,
        lng: position?.lng,
        accuracyMeters: position?.accuracy,
        answers: draft.answers,
        metadata: { device: navigator.userAgent },
        collectedAt: new Date().toISOString(),
      });

      resetSurvey();
      onComplete?.();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentSection) return null;

  return (
    <div className="max-w-xl mx-auto">
      <OfflineIndicator />
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-500 mb-2">
          <span>Sección {currentSectionIndex + 1} de {sections.length}</span>
          <span>{Math.round(((currentSectionIndex + 1) / sections.length) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${((currentSectionIndex + 1) / sections.length) * 100}%` }}
          />
        </div>
      </div>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">{currentSection.title}</h2>
      <div className="space-y-6">
        {currentSection.questions.map((question) => (
          <QuestionRenderer
            key={question.id}
            question={question}
            value={draft?.answers[question.id]}
            onChange={(value) => handleAnswer(question.id, value)}
          />
        ))}
      </div>
      <div className="flex justify-between mt-8 gap-3">
        {currentSectionIndex > 0 && (
          <Button variant="secondary" onClick={handleBack}>
            Anterior
          </Button>
        )}
        <div className="flex-1" />
        {isLastSection ? (
          <Button onClick={handleSubmit} isLoading={isSubmitting}>
            Enviar encuesta
          </Button>
        ) : (
          <Button onClick={handleNext}>
            Siguiente
          </Button>
        )}
      </div>
    </div>
  );
}
