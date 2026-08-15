import { Loader2, AlertCircle } from 'lucide-react';
import { humanApiError } from '../../api/client';

export function PanelLoading({ label = 'A carregar…' }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-on-surface-variant py-2">
      <Loader2 className="w-4 h-4 animate-spin text-secondary-container" />
      {label}
    </div>
  );
}

export function PanelError({ error }: { error: unknown }) {
  return (
    <div className="flex items-start gap-2 text-sm text-error py-2">
      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
      <span>{humanApiError(error)}</span>
    </div>
  );
}

export function PanelEmpty({ message }: { message: string }) {
  return <p className="text-sm text-on-surface-variant py-2">{message}</p>;
}

export function PanelValue({
  label,
  value,
  unit,
  sub,
}: {
  label: string;
  value: string | number | null | undefined;
  unit?: string;
  sub?: string;
}) {
  return (
    <div>
      <span className="font-label text-on-surface-variant uppercase">{label}</span>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-semibold text-on-surface">
          {value ?? '—'}
        </span>
        {unit && value != null && <span className="font-label-md text-outline">{unit}</span>}
      </div>
      {sub && <p className="text-xs text-on-surface-variant mt-1">{sub}</p>}
    </div>
  );
}
