'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Terminal } from 'lucide-react';

interface TopicInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
}

export function TopicInput({ value, onChange, onSubmit, disabled }: TopicInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!disabled && value.trim()) {
        onSubmit();
      }
    }
  };

  return (
    <div className="relative w-full group">
      <div className="absolute left-3 top-3 text-accent animate-pulse-glow z-10">
        <Terminal size={18} />
      </div>
      
      <textarea
        className={cn(
          "input-terminal w-full min-h-[120px] pl-10 pr-4 pt-3 resize-y",
          "bg-obsidian border-raw border text-primary type-mono",
          "focus:border-accent focus:ring-1 focus:ring-accent/20 transition-all",
          "placeholder:text-muted"
        )}
        placeholder="Enter topic or paste a syllabus..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        autoFocus
      />
      
      <div className="absolute right-3 bottom-3 flex items-center gap-2">
        <span className="text-xs text-muted font-mono bg-surface px-2 py-1 border border-raw">
          Press ↵ Enter
        </span>
      </div>
    </div>
  );
}
