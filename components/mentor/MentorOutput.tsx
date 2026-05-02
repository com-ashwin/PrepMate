'use client';

import React from 'react';
import { useSessionStore } from '@/lib/store';
import { SectionBlock } from './SectionBlock';
import { Terminal } from 'lucide-react';
import { motion } from 'framer-motion';

interface MentorOutputProps {
  sessionId: string;
}

export function MentorOutput({ sessionId }: MentorOutputProps) {
  const sections = useSessionStore((s) => s.sections);
  const isStreaming = useSessionStore((s) => s.isStreaming);

  if (sections.length === 0 && isStreaming) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-accent opacity-80">
        <Terminal size={32} className="animate-pulse-glow mb-6" />
        <p className="type-mono">Mentor is analyzing sources and structuring curriculum...</p>
        <div className="w-64 h-1 bg-surface mt-8 relative overflow-hidden border border-raw">
          <div className="absolute top-0 bottom-0 left-0 w-1/3 bg-accent animate-spin-slow"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {sections.map((section, index) => (
        <motion.div
          key={section.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 * Math.min(index, 5) }}
        >
          <SectionBlock section={section} sessionId={sessionId} />
        </motion.div>
      ))}

      {isStreaming && sections.length > 0 && (
        <div className="py-8 flex items-center gap-3 text-secondary">
          <span className="w-2 h-2 bg-accent rounded-full animate-cursor-blink"></span>
          <span className="type-mono text-sm">Receiving data stream...</span>
        </div>
      )}
    </div>
  );
}
