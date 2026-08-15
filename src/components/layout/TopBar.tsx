import { useState, type FormEvent } from 'react';
import { RefreshCw, Settings, User, Search } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import type { AppDomain } from '../../layers/types';
import { useAppStore } from '../../store/useAppStore';
import { parseCoordinates } from '../../lib/format';

const DOMAINS: { id: AppDomain; label: string }[] = [
  { id: 'fire', label: 'Fire' },
  { id: 'ocean', label: 'Ocean' },
  { id: 'climate', label: 'Climate' },
  { id: 'forests', label: 'Forests' },
];

interface TopBarProps {
  activeDomain: AppDomain;
  onDomainChange: (domain: AppDomain) => void;
}

export function TopBar({ activeDomain, onDomainChange }: TopBarProps) {
  const queryClient = useQueryClient();
  const setPickedLocation = useAppStore((s) => s.setPickedLocation);
  const [coordInput, setCoordInput] = useState('');
  const [coordError, setCoordError] = useState<string | null>(null);

  function handleCoordSearch(e: FormEvent) {
    e.preventDefault();
    const parsed = parseCoordinates(coordInput);
    if (!parsed) {
      setCoordError('Formato: lat lon (ex.: -23.55 -46.63)');
      return;
    }
    setCoordError(null);
    setPickedLocation(parsed);
  }

  return (
    <nav className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-4 md:px-8 h-16 bg-surface/80 backdrop-blur-xl border-b border-white/10">
      <div className="flex items-center gap-4 md:gap-8">
        <div className="text-2xl font-bold text-on-surface tracking-tight">BioScan</div>
        <div className="hidden md:flex items-center gap-6">
          {DOMAINS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => onDomainChange(id)}
              className={`font-medium transition-colors pb-1 ${
                activeDomain === id
                  ? 'text-secondary-container font-bold border-b-2 border-secondary-container'
                  : 'text-on-surface-variant hover:text-secondary'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <form onSubmit={handleCoordSearch} className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-4 h-4" />
          <input
            className="border-b border-outline/30 focus:border-secondary-container focus:ring-0 text-on-surface pl-9 pr-4 py-1.5 rounded-none outline-none font-label-md placeholder:text-outline w-48 transition-colors bg-transparent"
            placeholder="lat lon (ex. -23.55 -46.63)"
            type="text"
            aria-label="Pesquisar coordenadas"
            value={coordInput}
            onChange={(e) => setCoordInput(e.target.value)}
          />
          {coordError && (
            <p className="absolute top-full left-0 text-[10px] text-error-container mt-1">{coordError}</p>
          )}
        </form>
        <button
          type="button"
          className="text-secondary hover:text-secondary-container transition-colors p-1"
          aria-label="Actualizar dados"
          onClick={() => queryClient.invalidateQueries()}
        >
          <RefreshCw className="w-5 h-5" />
        </button>
        <button
          type="button"
          className="text-secondary hover:text-secondary-container transition-colors p-1"
          aria-label="Definições"
        >
          <Settings className="w-5 h-5" />
        </button>
        <div className="w-8 h-8 rounded-full overflow-hidden border border-outline/30 ml-1 bg-surface-container-high flex items-center justify-center">
          <User className="w-4 h-4 text-outline" />
        </div>
      </div>
    </nav>
  );
}
