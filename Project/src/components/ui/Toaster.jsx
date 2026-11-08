import { CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { useToastStore } from '../../store/toastStore';

const TONES = {
  success: { icon: CheckCircle2, color: 'text-emerald-600' },
  error: { icon: XCircle, color: 'text-red-600' },
  info: { icon: Info, color: 'text-brand-600' },
};

export default function Toaster() {
  const toasts = useToastStore((state) => state.toasts);
  const dismiss = useToastStore((state) => state.dismiss);

  return (
    <div aria-live="polite" className="pointer-events-none fixed right-4 bottom-4 left-4 z-[80] flex flex-col items-end gap-2 sm:left-auto sm:w-96">
      {toasts.map((item) => {
        const { icon: Icon, color } = TONES[item.tone];
        return (
          <div key={item.id} className="pointer-events-auto flex w-full items-start gap-3 rounded-xl border border-slate-200 bg-white p-3.5 shadow-raised animate-toast-in">
            <Icon className={`mt-0.5 size-4 shrink-0 ${color}`} aria-hidden="true" />
            <p className="flex-1 text-sm text-slate-800">{item.message}</p>
            <button type="button" onClick={() => dismiss(item.id)} aria-label="Dismiss message" className="text-slate-400 hover:text-slate-700">
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
