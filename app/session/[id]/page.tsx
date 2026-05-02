'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useSessionStore } from '@/lib/store';
import { useResearch } from '@/lib/hooks/useResearch';
import { Nav } from '@/components/ui/Nav';
import { MentorOutput } from '@/components/mentor/MentorOutput';
import { Terminal, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SessionPage() {
  const params = useParams();
  const sessionId = params.id as string;
  const [hasStarted, setHasStarted] = useState(false);
  
  const { activeSession, setActiveSession, error } = useSessionStore();
  
  // Fetch session details from DB
  const { data: sessionData, isLoading } = useQuery({
    queryKey: ['session', sessionId],
    queryFn: async () => {
      const res = await fetch(`/api/session?id=${sessionId}`);
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      return data.data;
    },
  });

  // Init SSE stream
  const { startResearch } = useResearch(
    sessionId, 
    sessionData?.topic || '', 
    sessionData?.depth || 'Advanced'
  );

  useEffect(() => {
    if (sessionData && !activeSession) {
      setActiveSession(sessionData);
    }
  }, [sessionData, activeSession, setActiveSession]);

  useEffect(() => {
    if (sessionData?.status === 'researching' && !hasStarted) {
      setHasStarted(true);
      startResearch();
    }
  }, [sessionData, hasStarted, startResearch]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Nav />
        <div className="flex-1 flex items-center justify-center">
          <Terminal className="text-accent animate-pulse-glow" size={32} />
        </div>
      </div>
    );
  }

  if (error || !sessionData) {
    return (
      <div className="min-h-screen flex flex-col">
        <Nav />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="panel border-orange max-w-md w-full flex flex-col gap-4 text-center">
            <AlertCircle size={32} className="text-orange mx-auto" />
            <h2 className="type-h3 text-orange uppercase">Session Error</h2>
            <p className="type-mono text-sm">{error || "Session not found"}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col h-screen overflow-hidden">
      <Nav />
      
      {/* Session Header */}
      <header className="bg-surface border-b border-raw px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <span className="tag tag-yellow">{sessionData.depth}</span>
          <h1 className="type-mono font-bold truncate max-w-[300px] md:max-w-[600px]" title={sessionData.topic}>
            {sessionData.topic}
          </h1>
        </div>
        
        {useSessionStore.getState().isStreaming && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-accent type-mono text-xs"
          >
            <span className="w-2 h-2 bg-accent rounded-full animate-cursor-blink"></span>
            SYNTHESIZING...
          </motion.div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto relative p-6">
        <div className="max-w-4xl mx-auto pb-32">
          <MentorOutput sessionId={sessionId} />
        </div>
      </main>
    </div>
  );
}
