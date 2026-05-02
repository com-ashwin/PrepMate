'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { HelpCircle, CheckCircle, ChevronDown } from 'lucide-react';

interface QuestionCardProps {
  question: string;
  answer: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
}

export function QuestionCard({ question, answer, difficulty = 'Medium' }: QuestionCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  const diffColor = {
    Easy: 'text-green',
    Medium: 'text-accent',
    Hard: 'text-orange',
  }[difficulty];

  return (
    <div className="panel p-0 overflow-hidden mb-4 border-raw hover:border-muted transition-colors">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 flex items-start gap-4 text-left bg-obsidian hover:bg-surface transition-colors"
      >
        <HelpCircle size={20} className={cn("shrink-0 mt-0.5", diffColor)} />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={cn("type-label", diffColor)}>{difficulty}</span>
          </div>
          <h3 className="type-body font-bold pr-8">{question}</h3>
        </div>
        <ChevronDown 
          size={16} 
          className={cn("shrink-0 text-muted transition-transform", isOpen && "rotate-180")} 
        />
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-surface"
          >
            <div className="p-4 border-t border-raw flex items-start gap-4">
              <CheckCircle size={20} className="text-green shrink-0 mt-0.5" />
              <div className="type-body text-secondary whitespace-pre-wrap">
                {answer}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
