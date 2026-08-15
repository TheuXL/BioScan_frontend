import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GlobeProvider } from './globe/GlobeContext';
import { AppShell } from './components/layout/AppShell';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <GlobeProvider>
        <AppShell />
      </GlobeProvider>
    </QueryClientProvider>
  );
}
