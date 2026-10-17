import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '../../store/useAppStore';
import { fetchFiresSyncStatus } from '../../api/endpoints/fire';

const DEFAULT_DAYS = 7;
const MAX_DAYS = 30;
const DEBOUNCE_MS = 400;

function formatDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

function rangeFromDays(endDate: string, days: number) {
  const end = new Date(endDate);
  const start = new Date(end);
  start.setDate(start.getDate() - days);
  return { startDate: formatDate(start), endDate };
}

export function TimeSlider() {
  const activeLayerIds = useAppStore((s) => s.activeLayerIds);
  const fireDateRange = useAppStore((s) => s.fireDateRange);
  const setFireDateRange = useAppStore((s) => s.setFireDateRange);
  const [days, setDays] = useState(DEFAULT_DAYS);

  const fireActive = activeLayerIds.includes('incendio-nasa');

  const syncStatus = useQuery({
    queryKey: ['fires', 'sync-status'],
    queryFn: fetchFiresSyncStatus,
    enabled: fireActive,
    staleTime: 60_000,
  });

  const endDate = useMemo(() => {
    if (syncStatus.data?.lastSyncTime) {
      return formatDate(new Date(syncStatus.data.lastSyncTime));
    }
    return formatDate(new Date());
  }, [syncStatus.data?.lastSyncTime]);

  useEffect(() => {
    if (!fireActive) {
      if (fireDateRange) setFireDateRange(null);
      return;
    }
    if (!fireDateRange) {
      setDays(DEFAULT_DAYS);
      setFireDateRange(rangeFromDays(endDate, DEFAULT_DAYS));
    }
  }, [fireActive, endDate, fireDateRange, setFireDateRange]);

  useEffect(() => {
    if (!fireActive) return;

    const timer = window.setTimeout(() => {
      const next = rangeFromDays(endDate, days);
      if (
        fireDateRange?.startDate === next.startDate &&
        fireDateRange?.endDate === next.endDate
      ) {
        return;
      }
      setFireDateRange(next);
    }, DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [days, endDate, fireActive, fireDateRange, setFireDateRange]);

  if (!fireActive) return null;

  return (
    <div className="absolute bottom-16 left-0 md:left-80 right-0 lg:right-96 px-4 md:px-8 z-30 pointer-events-none">
      <div className="glass-panel mx-auto max-w-4xl rounded-xl p-4 pointer-events-auto">
        <p className="font-label text-outline text-xs mb-3 uppercase">
          Filtro temporal · Incêndios NASA · últimos {days}{' '}
          {days === 1 ? 'dia' : 'dias'}
        </p>
        <div className="flex flex-col gap-2">
          <div className="flex justify-between font-label text-outline text-xs">
            <span>{fireDateRange?.startDate ?? rangeFromDays(endDate, days).startDate}</span>
            <span className="text-secondary-container font-bold">
              {days} {days === 1 ? 'dia' : 'dias'} · até{' '}
              {fireDateRange?.endDate ?? endDate}
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={MAX_DAYS}
            value={days}
            className="w-full accent-secondary-container"
            onChange={(e) => setDays(Number(e.target.value))}
            aria-label="Dias de histórico de incêndios"
          />
          <div className="flex justify-between text-[10px] text-outline">
            <span>1 dia</span>
            <span>{MAX_DAYS} dias</span>
          </div>
        </div>
      </div>
    </div>
  );
}
