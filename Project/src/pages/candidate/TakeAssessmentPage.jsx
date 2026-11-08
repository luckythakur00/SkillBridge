import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BadgeCheck, Check, ChevronLeft, ChevronRight, Clock, RotateCcw, X } from 'lucide-react';
import Button from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/Modal';
import { Badge, Card, ErrorState, PageHeader, PageLoader, ProgressBar } from '../../components/ui/Primitives';
import { useSkillStore } from '../../store/skillStore';
import { useAction } from '../../hooks/useAction';
import { SKILL_LEVEL_LABEL } from '../../constants';

const formatClock = (seconds) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

function ResultView({ assessment, result, onRetake }) {
  return (
    <div>
      <PageHeader title={`${assessment.title}: results`} backTo="/candidate/assessments" backLabel="Back to assessments" />
      <Card className="text-center">
        <p className="font-display text-5xl font-bold text-navy-900">{result.score}%</p>
        <p className="mt-2 text-sm text-slate-600">{result.correctCount} of {result.totalQuestions} answers correct</p>
        <div className="mt-4 flex justify-center">
          {result.passed ? (
            <Badge tone="success" icon={BadgeCheck} className="px-3 py-1 text-sm">Verified {SKILL_LEVEL_LABEL[result.level]}: {result.skillName}</Badge>
          ) : (
            <Badge className="px-3 py-1 text-sm">Not passed. A score of 50% is needed to verify this skill.</Badge>
          )}
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Button variant="secondary" icon={RotateCcw} onClick={onRetake}>Retake</Button>
          <Button to="/candidate/skill-mapping">See my skill mapping</Button>
        </div>
      </Card>

      <h2 className="mt-8 mb-3 text-base font-bold">Review your answers</h2>
      <ol className="space-y-3">
        {assessment.questions.map((question, index) => {
          const review = result.review.find((entry) => entry.questionId === question.id);
          return (
            <li key={question.id}>
              <Card>
                <p className="flex items-start gap-2 text-sm font-semibold text-slate-900">
                  {review.correct
                    ? <Check className="mt-0.5 size-4 shrink-0 text-emerald-600" aria-label="Correct" />
                    : <X className="mt-0.5 size-4 shrink-0 text-red-600" aria-label="Incorrect" />}
                  {index + 1}. {question.text}
                </p>
                <div className="mt-2 space-y-1 pl-6 text-sm">
                  {!review.correct && (
                    <p className="text-slate-600">Your answer: {review.selected === null ? 'Not answered' : question.options[review.selected]}</p>
                  )}
                  <p className="font-medium text-emerald-700">Correct answer: {question.options[review.correctIndex]}</p>
                </div>
              </Card>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export default function TakeAssessmentPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const assessment = useSkillStore((state) => state.activeAssessment);
  const error = useSkillStore((state) => state.errors.activeAssessment);
  const startAssessment = useSkillStore((state) => state.startAssessment);
  const submitAssessment = useSkillStore((state) => state.submitAssessment);

  const [answers, setAnswers] = useState({});
  const [index, setIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(null);
  const [result, setResult] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const answersRef = useRef(answers);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  const [submit, submitting] = useAction(async () => {
    setResult(await submitAssessment(id, answersRef.current));
  });

  useEffect(() => {
    startAssessment(id).then((loaded) => {
      if (loaded) setSecondsLeft(loaded.durationMinutes * 60);
    });
  }, [id, startAssessment]);

  const running = secondsLeft !== null && !result;
  useEffect(() => {
    if (!running) return undefined;
    const timer = setInterval(() => setSecondsLeft((value) => Math.max(value - 1, 0)), 1000);
    return () => clearInterval(timer);
  }, [running]);

  // Submits automatically when time runs out.
  useEffect(() => {
    if (secondsLeft === 0 && !result) submit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft, result]);

  const retake = useCallback(() => {
    setAnswers({});
    setIndex(0);
    setResult(null);
    setSecondsLeft(assessment.durationMinutes * 60);
    window.scrollTo({ top: 0 });
  }, [assessment]);

  if (error) return <Card><ErrorState message={error} onRetry={() => navigate('/candidate/assessments')} /></Card>;
  if (!assessment || assessment.id !== id) return <PageLoader />;
  if (result) return <ResultView assessment={assessment} result={result} onRetake={retake} />;

  const question = assessment.questions[index];
  const total = assessment.questions.length;
  const answeredCount = Object.keys(answers).length;
  const isLast = index === total - 1;
  const lowTime = secondsLeft !== null && secondsLeft <= 60;

  const handleSubmitClick = () => {
    if (answeredCount < total) setConfirmOpen(true);
    else submit();
  };

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title={assessment.title} description={assessment.description} backTo="/candidate/assessments" backLabel="Back to assessments" />
      <Card>
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="font-medium text-slate-700">Question {index + 1} of {total}</span>
          <span className={`flex items-center gap-1.5 font-semibold tabular-nums ${lowTime ? 'text-red-600' : 'text-slate-700'}`} role="timer" aria-label="Time left">
            <Clock className="size-4" aria-hidden="true" />
            {secondsLeft === null ? '' : formatClock(secondsLeft)}
          </span>
        </div>
        <div className="mt-3"><ProgressBar value={((index + 1) / total) * 100} size="sm" label="Assessment progress" /></div>

        <fieldset className="mt-6">
          <legend className="text-base font-semibold text-slate-900">{question.text}</legend>
          <div className="mt-4 space-y-2">
            {question.options.map((option, optionIndex) => {
              const selected = answers[question.id] === optionIndex;
              return (
                <label key={option} className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3.5 text-sm transition-colors ${selected ? 'border-brand-600 bg-brand-50 font-medium text-slate-900' : 'border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
                  <input
                    type="radio"
                    name={question.id}
                    checked={selected}
                    onChange={() => setAnswers((current) => ({ ...current, [question.id]: optionIndex }))}
                    className="size-4 accent-brand-600"
                  />
                  {option}
                </label>
              );
            })}
          </div>
        </fieldset>

        <div className="mt-6 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <Button variant="secondary" icon={ChevronLeft} disabled={index === 0} onClick={() => setIndex((value) => value - 1)}>Previous</Button>
          {isLast
            ? <Button loading={submitting} onClick={handleSubmitClick}>Submit</Button>
            : <Button iconRight={ChevronRight} onClick={() => setIndex((value) => value + 1)}>Next</Button>}
        </div>
      </Card>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        danger={false}
        title="Submit with unanswered questions?"
        description={`You have answered ${answeredCount} of ${total} questions. Unanswered questions count as incorrect.`}
        confirmLabel="Submit anyway"
        loading={submitting}
        onConfirm={async () => {
          setConfirmOpen(false);
          await submit();
        }}
      />
    </div>
  );
}
