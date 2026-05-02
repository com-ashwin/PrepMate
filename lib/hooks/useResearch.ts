import { useEffect, useCallback } from 'react';
import { useSessionStore } from '@/lib/store';
import { MentorSection } from '@/lib/types';
import { parseMentorSections } from '@/lib/utils';

export function useResearch(sessionId: string, topic: string, depth: string) {
  const {
    isStreaming,
    sections,
    setStreaming,
    addSection,
    updateSection,
    setError,
    setActiveSession,
  } = useSessionStore();

  const startResearch = useCallback(async () => {
    if (isStreaming) return;
    
    setStreaming(true);
    setError(null);

    try {
      const response = await fetch('/api/research/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          depth,
          session_id: sessionId,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error('Failed to start research stream');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let fullReport = '';

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          const events = chunk.split('\n\n').filter(Boolean);
          
          for (const eventStr of events) {
            if (!eventStr.startsWith('event: ')) continue;
            
            const eventTypeMatch = eventStr.match(/event: (.*?)\n/);
            const dataMatch = eventStr.match(/data: (.*)/);
            
            if (eventTypeMatch && dataMatch) {
              const eventType = eventTypeMatch[1];
              try {
                const data = JSON.parse(dataMatch[1]);
                
                if (eventType === 'section_start') {
                  // Add a new empty section
                  addSection({
                    id: `section-${data.type}-${Date.now()}`,
                    type: data.type,
                    title: data.title,
                    content: '',
                    order: sections.length,
                  });
                } 
                else if (eventType === 'section_content' || eventType === 'content') {
                  const currentSections = useSessionStore.getState().sections;
                  const lastSection = currentSections[currentSections.length - 1];
                  
                  if (lastSection) {
                    updateSection(lastSection.id, data.content || data.text || '');
                  }
                  if (data.text || data.content) {
                    fullReport += data.text || data.content;
                  }
                }
                else if (eventType === 'error' || eventType === 'fatal_error') {
                  setError(data.message);
                  setStreaming(false);
                }
                else if (eventType === 'complete') {
                  setStreaming(false);
                  
                  // Save full report to database
                  fetch('/api/session', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      id: sessionId,
                      status: 'complete',
                      report: data.report || fullReport,
                      sections: useSessionStore.getState().sections,
                    }),
                  });
                }
              } catch (e) {
                console.error("Failed to parse SSE event data:", e);
              }
            }
          }
        }
      }
    } catch (err: any) {
      setError(err.message);
      setStreaming(false);
    }
  }, [sessionId, topic, depth, isStreaming]);

  return { startResearch };
}
