import { Loader2, AlertCircle } from 'lucide-react';
import { humanApiError } from '../../api/client';
import { formatInteger, formatNumber } from '../../lib/format';

export function PanelLoading({ label = 'Carregando…' }: { label?: string }) {
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
  decimals = 1,
}: {
  label: string;
  value: string | number | null | undefined;
  unit?: string;
  sub?: string;
  decimals?: number;
}) {
  let display: string | number = '—';
  if (typeof value === 'number' && Number.isFinite(value)) {
    display = Number.isInteger(value) && decimals === 0
      ? formatInteger(value)
      : Number.isInteger(value)
        ? formatInteger(value)
        : formatNumber(value, decimals);
  } else if (typeof value === 'string' && value.trim()) {
    display = value;
  } else if (value != null && value !== '') {
    display = String(value);
  }

  return (
    <div>
      <span className="font-label text-on-surface-variant uppercase">{label}</span>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-semibold text-on-surface">{display}</span>
        {unit && display !== '—' && (
          <span className="font-label-md text-outline">{unit}</span>
        )}
      </div>
      {sub && <p className="text-xs text-on-surface-variant mt-1">{sub}</p>}
    </div>
  );
}
