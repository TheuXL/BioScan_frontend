import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchMeteoForecast, fetchAirQuality, fetchMeteoArchive } from '../../api/endpoints/panel';
import { fetchOpenAqLocationLatest, fetchOpenAqLocation } from '../../api/endpoints/openaq';
import { PanelEmpty, PanelError, PanelLoading, PanelValue } from '../ui/PanelState';
import { readAirQualityCurrent, readMeteoCurrent, readOpenAqLatest } from '../../lib/panelData';
import { archiveDateRange, formatCoordinates, formatDateShort } from '../../lib/format';

interface LocalMeteoPanelProps {
  lat: number;
  lon: number;
  onClose?: () => void;
  defaultExpanded?: boolean;
}

export function LocalMeteoPanel({
  lat,
  lon,
  onClose,
  defaultExpanded = false,
}: LocalMeteoPanelProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const archiveRange = archiveDateRange(7);

  const forecast = useQuery({
    queryKey: ['panel', 'meteo', 'forecast', lat, lon],
    queryFn: () => fetchMeteoForecast(lat, lon),
    staleTime: 300_000,
    enabled: expanded,
  });
  const archive = useQuery({
    queryKey: ['panel', 'meteo', 'archive', lat, lon, archiveRange],
    queryFn: () =>
      fetchMeteoArchive(lat, lon, archiveRange.startDate, archiveRange.endDate, {
        daily: 'temperature_2m_max,temperature_2m_min',
      }),
    staleTime: 300_000,
    enabled: expanded,
  });
  const air = useQuery({
    queryKey: ['panel', 'meteo', 'air-quality', lat, lon],
    queryFn: () => fetchAirQuality(lat, lon),
    staleTime: 300_000,
    enabled: expanded,
  });

  const meteo = forecast.data ? readMeteoCurrent(forecast.data) : null;
  const aqi = air.data ? readAirQualityCurrent(air.data) : null;
  const archiveDaily = archive.data?.daily as
    | { time?: string[]; temperature_2m_max?: number[]; temperature_2m_min?: number[] }
    | undefined;
  const lastArchiveDay = archiveDaily?.time?.length ? archiveDaily.time.length - 1 : -1;

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between text-left"
        aria-expanded={expanded}
      >
        <span className="font-label text-outline uppercase text-xs">Contexto local</span>
        {expanded ? (
          <ChevronDown className="w-4 h-4 text-outline" />
        ) : (
          <ChevronRight className="w-4 h-4 text-outline" />
        )}
      </button>

      {!expanded && (
        <p className="text-xs text-on-surface-variant">
          Toque para ver previsão, histórico e qualidade do ar em{' '}
          {formatCoordinates(lat, lon)}.
        </p>
      )}

      {expanded && (
        <div className="space-y-4">
          <p className="font-label-md text-secondary-container">{formatCoordinates(lat, lon)}</p>

          {forecast.isLoading && <PanelLoading label="Carregando previsão…" />}
          {forecast.isError && <PanelError error={forecast.error} />}
          {meteo && (
            <div className="glass-panel rounded-lg p-3 space-y-2">
              <p className="font-label text-outline uppercase">Previsão local</p>
              <PanelValue label="Temperatura" value={meteo.temperature} unit="°C" />
              <PanelValue label="Umidade" value={meteo.humidity} unit="%" decimals={0} />
              <PanelValue label="Vento" value={meteo.windSpeed} unit="km/h" />
            </div>
          )}
          {!forecast.isLoading && !meteo && !forecast.isError && (
            <PanelEmpty message="Previsão indisponível para esta coordenada." />
          )}

          {archive.isLoading && <PanelLoading label="Carregando histórico…" />}
          {archive.isError && <PanelError error={archive.error} />}
          {lastArchiveDay >= 0 && archiveDaily && (
            <div className="glass-panel rounded-lg p-3 space-y-2">
              <p className="font-label text-outline uppercase">Histórico recente</p>
              <PanelValue
                label={formatDateShort(archiveDaily.time?.[lastArchiveDay] ?? null)}
                value={archiveDaily.temperature_2m_max?.[lastArchiveDay]}
                unit="°C máx"
              />
              <PanelValue
                label="Mínima"
                value={archiveDaily.temperature_2m_min?.[lastArchiveDay]}
                unit="°C"
              />
            </div>
          )}

          {air.isLoading && <PanelLoading label="Carregando qualidade do ar…" />}
          {air.isError && <PanelError error={air.error} />}
          {aqi && (
            <div className="glass-panel rounded-lg p-3 space-y-2">
              <p className="font-label text-outline uppercase">Qualidade do ar</p>
              <PanelValue label="US AQI" value={aqi.usAqi} decimals={0} />
              <PanelValue label="PM2.5" value={aqi.pm25} unit="µg/m³" />
              <PanelValue label="PM10" value={aqi.pm10} unit="µg/m³" />
            </div>
          )}

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="text-xs text-outline hover:text-secondary-container"
            >
              Fechar localização
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export function OpenAqPointDetail({ locationId }: { locationId: number }) {
  const location = useQuery({
    queryKey: ['openaq', 'location', locationId],
    queryFn: () => fetchOpenAqLocation(locationId),
    staleTime: 300_000,
  });
  const latest = useQuery({
    queryKey: ['openaq', 'latest', locationId],
    queryFn: () => fetchOpenAqLocationLatest(locationId),
    staleTime: 120_000,
  });

  if (location.isLoading || latest.isLoading) return <PanelLoading />;
  if (location.isError && latest.isError) return <PanelError error={latest.error} />;
  if (!location.data && !latest.data) return <PanelEmpty message="Sem medições recentes." />;

  const measurements = latest.data ? readOpenAqLatest(latest.data) : [];

  return (
    <div className="space-y-2 mt-2 border-t border-white/10 pt-4">
      <p className="font-label text-outline uppercase">Qualidade do ar na estação</p>
      {location.data && (
        <p className="text-sm text-on-surface">
          {location.data.name}
          {location.data.locality ? ` · ${location.data.locality}` : ''}
        </p>
      )}
      {measurements.length > 0 ? (
        <div className="space-y-2">
          {measurements.map((m) => (
            <div key={m.name} className="flex justify-between text-sm glass-panel rounded p-2">
              <span>{m.name}</span>
              <span className="font-label-md">
                {m.value}
                {m.unit ? ` ${m.unit}` : ''}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <PanelEmpty message="Sem leituras recentes nesta estação." />
      )}
    </div>
  );
}
