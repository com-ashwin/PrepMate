'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { DepthLevel } from '@/lib/types';
import { Signal, BarChart, Target } from 'lucide-react';

interface DepthSelectorProps {
  selected: DepthLevel;
  onChange: (depth: DepthLevel) => void;
}

export function DepthSelector({ selected, onChange }: DepthSelectorProps) {
  const options: { level: DepthLevel; icon: React.ReactNode; desc: string }[] = [
    { level: 'Beginner', icon: <Signal size={16} />, desc: 'Core concepts & analogies' },
    { level: 'Advanced', icon: <BarChart size={16} />, desc: 'Technical deep dive' },
    { level: 'Interview-Ready', icon: <Target size={16} />, desc: 'FAANG-level grilling' },
  ];

  return (
    <div className="space-y-3">
      <label className="type-label text-secondary flex items-center gap-2">
        <span className="w-2 h-2 bg-accent inline-block"></span>
        Target Depth
      </label>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {options.map((opt) => {
          const isSelected = selected === opt.level;
          return (
            <button
              key={opt.level}
              onClick={() => onChange(opt.level)}
              className={cn(
                "text-left p-3 border transition-all duration-200",
                isSelected 
                  ? "bg-accent/10 border-accent text-primary" 
                  : "bg-surface border-raw text-secondary hover:border-muted"
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={cn(
                  "font-bold type-mono text-sm uppercase",
                  isSelected ? "text-accent" : ""
                )}>
                  {opt.level}
                </span>
                <span className={isSelected ? "text-accent" : "text-muted"}>
                  {opt.icon}
                </span>
              </div>
              <p className="text-xs font-mono mt-2 opacity-80">
                {opt.desc}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
