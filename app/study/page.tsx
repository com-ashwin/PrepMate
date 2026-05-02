'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Nav } from '@/components/ui/Nav';
import { TopicInput } from '@/components/ui/TopicInput';
import { DropZone } from '@/components/upload/DropZone';
import { DepthSelector } from '@/components/ui/DepthSelector';
import { useSessionStore, useUIStore } from '@/lib/store';
import { DepthLevel, ResearchSource } from '@/lib/types';
import { FileText, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function StudyWorkspace() {
  const router = useRouter();
  const [source, setSource] = useState<ResearchSource>('topic');
  const [topic, setTopic] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const activeDepth = useUIStore((s) => s.activeDepth);
  const setActiveDepth = useUIStore((s) => s.setActiveDepth);

  const handleStartResearch = async () => {
    if (!topic.trim()) return;
    setIsSubmitting(true);
    
    try {
      // 1. Create session in DB
      const res = await fetch('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          depth: activeDepth,
          source,
        }),
      });
      
      const data = await res.json();
      
      if (data.success && data.data) {
        // 2. Redirect to session view
        router.push(`/session/${data.data.id}`);
      } else {
        throw new Error(data.error || 'Failed to create session');
      }
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Nav />
      
      <main className="flex-1 flex flex-col items-center justify-center p-6 pb-20 relative">
        <div className="max-w-3xl w-full mx-auto space-y-12">
          
          <div className="text-center space-y-4">
            <h1 className="type-h2 uppercase">Initiate Protocol</h1>
            <p className="type-body text-secondary">
              Select your input method and define the parameters. The mentor will construct a structured curriculum.
            </p>
          </div>

          <div className="panel space-y-8 relative z-10 bg-obsidian">
            {/* Source Toggle */}
            <div className="flex p-1 bg-bg-raised border border-raw w-fit mx-auto">
              <button
                onClick={() => setSource('topic')}
                className={cn(
                  "flex items-center gap-2 px-6 py-2 type-label transition-colors",
                  source === 'topic' ? "bg-accent text-obsidian font-bold" : "text-secondary hover:text-primary"
                )}
              >
                <Search size={14} /> Topic
              </button>
              <button
                onClick={() => setSource('file')}
                className={cn(
                  "flex items-center gap-2 px-6 py-2 type-label transition-colors",
                  source === 'file' ? "bg-accent text-obsidian font-bold" : "text-secondary hover:text-primary"
                )}
              >
                <FileText size={14} /> Upload Syllabus
              </button>
            </div>

            {/* Input Area */}
            <div className="min-h-[200px] flex flex-col justify-center">
              {source === 'topic' ? (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <TopicInput 
                    value={topic}
                    onChange={setTopic}
                    onSubmit={handleStartResearch}
                    disabled={isSubmitting}
                  />
                  <DepthSelector 
                    selected={activeDepth} 
                    onChange={(d) => setActiveDepth(d as DepthLevel)} 
                  />
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <DropZone 
                    onFileParsed={(parsed) => {
                      // Pre-fill topic and suggest starting
                      setTopic(`Research curriculum based on: ${parsed.name}\n\nTopics:\n${parsed.topics.join(', ')}`);
                      setSource('topic'); // Switch back to topic to review before submit
                    }}
                  />
                </motion.div>
              )}
            </div>

            {/* Submit */}
            {source === 'topic' && (
              <div className="pt-6 border-t border-raw flex justify-end">
                <button 
                  className="btn-primary"
                  onClick={handleStartResearch}
                  disabled={isSubmitting || !topic.trim()}
                >
                  {isSubmitting ? 'INITIALIZING...' : 'START DEEP RESEARCH'}
                </button>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
