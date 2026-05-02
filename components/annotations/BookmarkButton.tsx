'use client';

import React, { useState } from 'react';
import { Bookmark as BookmarkIcon } from 'lucide-react';
import { useAnnotationStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { useQueryClient } from '@tanstack/react-query';

interface BookmarkButtonProps {
  sessionId: string;
  sectionId: string;
  sectionTitle: string;
}

export function BookmarkButton({ sessionId, sectionId, sectionTitle }: BookmarkButtonProps) {
  const isBookmarked = useAnnotationStore((s) => s.isBookmarked(sectionId));
  const addBookmark = useAnnotationStore((s) => s.addBookmark);
  const removeBookmark = useAnnotationStore((s) => s.removeBookmark);
  const bookmarks = useAnnotationStore((s) => s.bookmarks);
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleToggle = async () => {
    setIsLoading(true);
    try {
      if (isBookmarked) {
        const bm = bookmarks.find((b) => b.sectionId === sectionId);
        if (bm) {
          await fetch(`/api/annotations?id=${bm.id}&type=bookmark`, { method: 'DELETE' });
          removeBookmark(bm.id);
        }
      } else {
        const res = await fetch('/api/annotations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'bookmark',
            sessionId,
            sectionId,
            sectionTitle,
          }),
        });
        const data = await res.json();
        if (data.success) {
          addBookmark(data.data);
        }
      }
      // Invalidate session query to refresh counts
      queryClient.invalidateQueries({ queryKey: ['session', sessionId] });
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={cn(
        "btn-icon transition-all duration-300",
        isBookmarked ? "text-accent border-accent bg-accent/10" : ""
      )}
      title={isBookmarked ? "Remove bookmark" : "Bookmark this section"}
    >
      <BookmarkIcon 
        size={16} 
        className={cn(isBookmarked ? "fill-accent" : "fill-transparent")} 
      />
    </button>
  );
}
