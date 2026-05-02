'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { OnboardingModal } from './user/OnboardingModal';
import { useUIStore } from '@/lib/store';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => queryClient);
  const onboardingComplete = useUIStore((s) => s.onboardingComplete);

  return (
    <QueryClientProvider client={client}>
      {children}
      {!onboardingComplete && <OnboardingModal />}
    </QueryClientProvider>
  );
}
