'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '@/lib/store';
import { Terminal, Brain, Target, ShieldAlert } from 'lucide-react';
import { FloatingCard } from '../3d/FloatingCard';

export function OnboardingModal() {
  const completeOnboarding = useUIStore((s) => s.setOnboardingComplete);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-obsidian/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          className="max-w-2xl w-full"
        >
          <FloatingCard intensity={10} className="w-full">
            <div className="panel border-accent w-full bg-surface shadow-2xl relative overflow-hidden">
              {/* Scanline effect */}
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-accent/5 to-transparent h-10 animate-scan-line" />
              
              <div className="flex items-center gap-3 mb-6 border-b border-raw pb-4">
                <ShieldAlert className="text-accent" size={24} />
                <h2 className="type-h3 uppercase tracking-wider">SYSTEM INITIALIZATION</h2>
              </div>

              <div className="space-y-6">
                <p className="type-body text-secondary">
                  Welcome to <strong className="text-primary">PrepMate</strong>. You are about to interact with a highly rigorous AI mentor designed for serious learners and FAANG candidates.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border border-raw bg-obsidian flex flex-col gap-2">
                    <Terminal className="text-accent" size={20} />
                    <h3 className="type-mono font-bold text-sm">NO CHAT. PURE DATA.</h3>
                    <p className="text-xs text-secondary">
                      This is not a conversational chatbot. It is a one-shot deep-research curriculum synthesizer.
                    </p>
                  </div>
                  <div className="p-4 border border-raw bg-obsidian flex flex-col gap-2">
                    <Brain className="text-orange" size={20} />
                    <h3 className="type-mono font-bold text-sm">BRUTALLY HONEST.</h3>
                    <p className="text-xs text-secondary">
                      The mentor will highlight your common mistakes and grill you with real interview questions.
                    </p>
                  </div>
                </div>

                <div className="bg-hl-yellow border border-accent p-4 text-sm type-mono">
                  <span className="text-accent font-bold">PROTOCOL:</span> Define your topic or upload a syllabus. Select depth. Wait for the data stream to complete. Bookmark sections for review.
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-raw flex justify-end">
                <button 
                  onClick={() => completeOnboarding(true)}
                  className="btn-primary"
                >
                  ACKNOWLEDGE & PROCEED
                </button>
              </div>
            </div>
          </FloatingCard>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
