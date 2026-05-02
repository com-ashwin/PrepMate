'use client';

import React, { useMemo } from 'react';
import { MentorSection } from '@/lib/types';
import { sectionTypeLabel, sectionAccentColor, cn } from '@/lib/utils';
import { BookmarkButton } from '../annotations/BookmarkButton';
import { NoteEditor } from '../annotations/NoteEditor';
import ReactMarkdown from 'react-markdown';

interface SectionBlockProps {
  section: MentorSection;
  sessionId: string;
}

export function SectionBlock({ section, sessionId }: SectionBlockProps) {
  const accentColor = sectionAccentColor(section.type);
  
  // Format the content using ReactMarkdown for bold, lists, and code blocks
  const content = useMemo(() => {
    return (
      <ReactMarkdown
        components={{
          h1: ({node, ...props}) => <h1 className="type-h2 mb-4 mt-6" {...props} />,
          h2: ({node, ...props}) => <h2 className="type-h3 mb-3 mt-5" {...props} />,
          h3: ({node, ...props}) => <h3 className="text-lg font-bold mb-2 mt-4" {...props} />,
          p: ({node, ...props}) => <p className="type-body mb-4" {...props} />,
          ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-4 space-y-2" {...props} />,
          ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-4 space-y-2" {...props} />,
          li: ({node, ...props}) => <li className="type-body" {...props} />,
          strong: ({node, ...props}) => <strong className="font-bold text-primary" {...props} />,
          blockquote: ({node, ...props}) => (
            <blockquote className="border-l-2 border-accent pl-4 italic text-secondary my-4" {...props} />
          ),
          code: ({node, inline, className, children, ...props}: any) => {
            const match = /language-(\w+)/.exec(className || '');
            return !inline ? (
              <div className="my-4 bg-obsidian border border-raw overflow-hidden">
                <div className="bg-surface px-4 py-1 text-xs type-mono text-muted border-b border-raw">
                  {match?.[1] || 'code'}
                </div>
                <pre className="p-4 overflow-x-auto">
                  <code className={cn("type-mono text-sm text-primary", className)} {...props}>
                    {children}
                  </code>
                </pre>
              </div>
            ) : (
              <code className="type-mono bg-surface px-1.5 py-0.5 text-sm text-accent" {...props}>
                {children}
              </code>
            );
          }
        }}
      >
        {section.content}
      </ReactMarkdown>
    );
  }, [section.content]);

  return (
    <div 
      className="section-block"
      style={{ borderLeftColor: accentColor }}
      id={`section-${section.id}`}
    >
      <div className="section-block-header">
        <div className="flex items-center gap-3">
          <span 
            className="section-number"
            style={{ color: accentColor }}
          >
            {String(section.order + 1).padStart(2, '0')}
          </span>
          <h2 className="type-mono font-bold uppercase tracking-widest text-sm">
            {sectionTypeLabel(section.type)}
          </h2>
        </div>
        
        <BookmarkButton 
          sessionId={sessionId} 
          sectionId={section.id} 
          sectionTitle={sectionTypeLabel(section.type)} 
        />
      </div>

      <div className="relative">
        {content}
      </div>

      <NoteEditor sessionId={sessionId} sectionId={section.id} />
    </div>
  );
}
