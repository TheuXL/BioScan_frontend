import { useEffect, useMemo } from 'react';
import { Play } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '../../store/useAppStore';
import { fetchFiresSyncStatus } from '../../api/endpoints/fire';

function formatDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

export function TimeSlider() {
  const activeLayerIds = useAppStore((s) => s.activeLayerIds);
  const fireDateRange = useAppStore((s) => s.fireDateRange);
  const setFireDateRange = useAppStore((s) => s.setFireDateRange);

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

  const startDate = useMemo(() => {
    const end = new Date(endDate);
    end.setDate(end.getDate() - 7);
    return formatDate(end);
  }, [endDate]);

  useEffect(() => {
    if (fireActive && !fireDateRange) {
      setFireDateRange({ startDate, endDate });
    }
    if (!fireActive && fireDateRange) {
      setFireDateRange(null);
    }
  }, [fireActive, startDate, endDate, fireDateRange, setFireDateRange]);

  if (!fireActive) return null;

  return (
    <div className="absolute bottom-16 left-0 md:left-80 right-0 px-4 md:px-8 z-30 pointer-events-none">
      <div className="glass-panel mx-auto max-w-4xl rounded-xl p-4 pointer-events-auto">
        <p className="font-label text-outline text-xs mb-3 uppercase">
          Filtro temporal · Incêndios NASA · {fireDateRange?.startDate ?? startDate} →{' '}
          {fireDateRange?.endDate ?? endDate}
        </p>
        <div className="flex items-center gap-6">
          <button
            type="button"
            className="w-10 h-10 rounded-full bg-secondary-container/10 border border-secondary-container/30 flex items-center justify-center text-secondary-container"
            aria-label="Período activo"
          >
            <Play className="w-5 h-5 fill-current" />
          </button>
          <div className="flex-1 flex flex-col gap-2">
            <div className="flex justify-between font-label text-outline">
              <span>{fireDateRange?.startDate ?? startDate}</span>
              <span className="text-secondary-container font-bold">
                {fireDateRange?.endDate ?? endDate}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={30}
              defaultValue={30}
              className="w-full accent-secondary-container"
              onChange={(e) => {
                const days = Number(e.target.value);
                const end = new Date(endDate);
                const start = new Date(end);
                start.setDate(start.getDate() - days);
                setFireDateRange({ startDate: formatDate(start), endDate });
              }}
              aria-label="Dias de histórico de incêndios"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
