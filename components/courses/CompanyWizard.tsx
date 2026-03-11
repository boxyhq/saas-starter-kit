// CompanyWizard.tsx
'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { createCourse } from '@/lib/course';

type WizardPayload = {
  rolle: string;
  bransje: string;
  tools: string[];
  language: 'no' | 'en';
  painpoints: string[];
  ai_level: number; // 1-5
  job_level: number; // 1-5
  knowledge: string;
  sessionDuration: string;
  stil: string; // brukes kun til å lage constraints
  constraints: string[];
  level: number; // fast 1
};

const TOOL_OPTIONS = [
  'ChatGPT (gratis)',
  'ChatGPT Plus',
  'Microsoft Copilot',
  'Google Gemini',
  'Claude',
  'Perplexity',
  'n8n',
  'Zapier',
  'Make',
  'Notion',
  'OneNote',
] as const;

const STYLE_OPTIONS = [
  'Utfordrende og profesjonell',
  'Vennlig og pedagogisk',
  'Kort og rett på sak',
] as const;

const DURATION_OPTIONS = ['10 minutter', '20 minutter', '30 minutter'] as const;

const questions = [
  { key: 'rolle', question: 'Hva er din rolle?', type: 'input' },
  { key: 'bransje', question: 'Hvilken bransje/jobbfelt jobber du i?', type: 'input' },
  {
    key: 'tools',
    question: 'Hvilke verktøy bruker du (eller ønsker å bruke)?',
    type: 'multi',
    options: [...TOOL_OPTIONS],
  },
  {
    key: 'language',
    question: 'Hvilket språk skal kurset være på?',
    type: 'options',
    options: ['Norsk', 'English'],
  },
  {
    key: 'painpoints',
    question: 'Hva er de viktigste pain points i hverdagen din?',
    type: 'multi',
    options: [
      'Bruker for mye tid på rutinepreget rapportskriving',
      'Bruker for mye tid på e-post og oppfølging',
      'Mye manuelt arbeid / copy-paste mellom systemer',
      'Usikker på personvern og kildekritikk i AI-svar',
      "AI-output blir for generisk og mangler min 'stemme'",
      'Vanskelig å komme i gang med gode prompts',
      'Mye tid går til å lete etter informasjon',
    ],
  },
  {
    key: 'ai_level',
    question: 'Hvor god er du på AI i dag? (1–5)',
    type: 'scale',
    min: 1,
    max: 5,
  },
  {
    key: 'job_level',
    question: 'Hvor senior er du i faget/rollen? (1–5)',
    type: 'scale',
    min: 1,
    max: 5,
  },
  {
    key: 'knowledge',
    question: 'Kort: hva kan du fra før, og hva føler du at du mangler kontroll på?',
    type: 'textarea',
  },
  {
    key: 'sessionDuration',
    question: 'Hvor lang skal økten være?',
    type: 'options',
    options: [...DURATION_OPTIONS],
  },
  {
    key: 'stil',
    question: 'Hvilken stil/tone vil du ha?',
    type: 'options',
    options: [...STYLE_OPTIONS],
  },
] as const;

export default function CompanyWizard() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const { slug } = router.query;
  const userId = typeof slug === 'string' ? slug : null;

  const totalSteps = questions.length;
  const isSummary = step >= totalSteps;

  const progressPct = useMemo(() => {
    const done = Math.min(step, totalSteps);
    return Math.round((done / totalSteps) * 100);
  }, [step, totalSteps]);

  const buildConstraints = (p: {
    language: 'no' | 'en';
    bransje: string;
    stil: string;
  }) => {
    const constraints: string[] = [];

    constraints.push(p.language === 'no' ? 'Svar alltid på norsk' : 'Always answer in English');

    if (p.bransje?.trim()) {
      constraints.push(`Eksempler må være relevante for ${p.bransje.trim()}`);
    }

    if (p.stil?.trim()) {
      constraints.push(`${p.stil.trim()} tone`);
    }

    return constraints;
  };

  const previewPayload: WizardPayload = useMemo(() => {
    const language: 'no' | 'en' =
      answers.language === 'English' ? 'en' : 'no';

    const stil = (answers.stil as string) || 'Utfordrende og profesjonell';

    const payload: WizardPayload = {
      rolle: (answers.rolle || '').trim(),
      bransje: (answers.bransje || '').trim(),
      tools: Array.isArray(answers.tools) ? answers.tools : [],
      language,
      painpoints: Array.isArray(answers.painpoints) ? answers.painpoints : [],
      ai_level: Number(answers.ai_level || 1),
      job_level: Number(answers.job_level || 1),
      level: 1,
      knowledge: (answers.knowledge || '').trim(),
      sessionDuration: (answers.sessionDuration as string) || '20 minutter',
      stil,
      constraints: buildConstraints({ language, bransje: answers.bransje || '', stil }),
    };

    return payload;
  }, [answers]);

  const handleNext = (value: any) => {
    const key = questions[step].key;
    setAnswers((prev) => ({ ...prev, [key]: value }));
    setStep((s) => s + 1);
  };

  const handleBack = () => {
    setError(null);
    setStep((s) => Math.max(0, s - 1));
  };

  const handleGenerate = async () => {
    if (!userId) {
      setError('Fant ikke bruker/team-ID i URL');
      return;
    }

    // enkel minimumsvalidering
    if (!previewPayload.rolle) {
      setError('Rolle kan ikke være tom');
      return;
    }
    if (!previewPayload.bransje) {
      setError('Bransje kan ikke være tom');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // createCourse sender hele objektet videre som body
      const result = await createCourse(userId, previewPayload as any);

      router.push(
        `/teams/${userId}/courses?courseId=${result.courseId}&generating=1`
      );
    } catch (err: any) {
      console.error('Error creating course:', err);
      setError(err.message ?? 'Noe gikk galt ved opprettelse av kurs');
      setLoading(false);
    }
  };

  const ProgressBar = () => (
    <div className="max-w-xl mx-auto px-4">
      <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
        <span>
          Steg {Math.min(step + 1, totalSteps)} av {totalSteps}
        </span>
        <span>{progressPct}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded h-2">
        <div
          className="bg-black h-2 rounded"
          style={{ width: `${progressPct}%` }}
        />
      </div>
    </div>
  );

  const renderStep = () => {
    const current = questions[step];
    if (!current) return null;

    return (
      <div className="max-w-xl mx-auto p-4">
        <h2 className="text-xl font-semibold mb-4">{current.question}</h2>

        {current.type === 'options' && (
          <div className="space-y-2">
            {current.options.map((opt: any) => (
              <button
                key={opt}
                onClick={() => handleNext(opt)}
                className="w-full bg-white border rounded px-4 py-2 hover:bg-gray-100 text-left"
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        {current.type === 'input' && (
          <input
            type="text"
            className="w-full border rounded px-4 py-2"
            placeholder="Skriv inn..."
            defaultValue={answers[current.key] || ''}
            onBlur={(e) => handleNext(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleNext((e.target as HTMLInputElement).value);
              }
            }}
          />
        )}

        {current.type === 'textarea' && (
          <textarea
            className="w-full border rounded px-4 py-2 min-h-[120px]"
            placeholder="Skriv inn..."
            defaultValue={answers[current.key] || ''}
            onBlur={(e) => handleNext(e.target.value)}
          />
        )}

        {current.type === 'multi' && (
          <MultiSelect
            options={(current as any).options}
            initialSelected={answers[current.key] || []}
            onSubmit={handleNext}
          />
        )}

        {current.type === 'scale' && (
          <ScaleSelect
            min={(current as any).min}
            max={(current as any).max}
            initialValue={answers[current.key] || (current as any).min}
            onSubmit={handleNext}
          />
        )}

        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={handleBack}
            disabled={step === 0}
            className="px-4 py-2 rounded border bg-white disabled:opacity-50"
          >
            Tilbake
          </button>
          <div className="text-sm text-gray-500">
            Tips: Enter / Neste for raskt videre
          </div>
        </div>
      </div>
    );
  };

  const renderSummary = () => (
    <div className="max-w-xl mx-auto p-6 space-y-4">
      <h2 className="text-xl font-bold">Preview før generering</h2>

      <p className="text-gray-700">
        Dette er det som sendes til skallflyten når du trykker “Start generering”.
      </p>

      <div className="rounded border bg-white p-4 text-sm overflow-auto">
        <pre>{JSON.stringify(previewPayload, null, 2)}</pre>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleBack}
          className="bg-white border px-4 py-2 rounded"
          disabled={loading}
        >
          Tilbake
        </button>

        <button
          onClick={handleGenerate}
          className="bg-black text-white px-4 py-2 rounded"
          disabled={loading}
        >
          {loading ? 'Genererer kurs…' : 'Start generering'}
        </button>
      </div>

      {error && <p className="text-red-600">{error}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pt-14">
      <ProgressBar />
      <div className="pt-6">
        {!isSummary && renderStep()}
        {isSummary && renderSummary()}
      </div>
    </div>
  );
}

function MultiSelect({
  options,
  onSubmit,
  initialSelected,
}: {
  options: string[];
  onSubmit: (vals: string[]) => void;
  initialSelected?: string[];
}) {
  const [selected, setSelected] = useState<string[]>(
    Array.isArray(initialSelected) ? initialSelected : []
  );

  const toggle = (val: string) => {
    setSelected((prev) =>
      prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]
    );
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => toggle(opt)}
            className={`px-3 py-1 border rounded-full ${
              selected.includes(opt) ? 'bg-blue-600 text-white' : 'bg-white'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>

      <button
        onClick={() => onSubmit(selected)}
        className="bg-black text-white px-4 py-2 rounded"
      >
        Neste
      </button>
    </div>
  );
}

function ScaleSelect({
  min,
  max,
  onSubmit,
  initialValue,
}: {
  min: number;
  max: number;
  onSubmit: (val: number) => void;
  initialValue?: number;
}) {
  const [val, setVal] = useState<number>(Number(initialValue ?? min));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>{min}</span>
        <span className="font-semibold text-black">{val}</span>
        <span>{max}</span>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        value={val}
        onChange={(e) => setVal(Number(e.target.value))}
        className="w-full"
      />

      <button
        onClick={() => onSubmit(val)}
        className="bg-black text-white px-4 py-2 rounded"
      >
        Neste
      </button>
    </div>
  );
}