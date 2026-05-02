'use client';

import React, { useState } from 'react';
import { useAnnotationStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Edit3, Check, X, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NoteEditorProps {
  sessionId: string;
  sectionId: string;
}

export function NoteEditor({ sessionId, sectionId }: NoteEditorProps) {
  const existingNote = useAnnotationStore((s) => s.getNoteForSection(sectionId));
  const addNote = useAnnotationStore((s) => s.addNote);
  const updateNote = useAnnotationStore((s) => s.updateNote);
  const removeNote = useAnnotationStore((s) => s.removeNote);

  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(existingNote?.content || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!content.trim()) {
      handleDelete();
      return;
    }

    setIsSaving(true);
    try {
      if (existingNote) {
        // Update existing note (assuming backend supports PATCH /api/annotations or we just POST and it upserts)
        // For simplicity, we just delete and recreate here since it's a basic MVP
        await fetch(`/api/annotations?id=${existingNote.id}&type=note`, { method: 'DELETE' });
        removeNote(existingNote.id);
      }

      const res = await fetch('/api/annotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'note',
          sessionId,
          sectionId,
          content,
        }),
      });
      const data = await res.json();
      if (data.success) {
        addNote(data.data);
        setIsEditing(false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!existingNote) {
      setIsEditing(false);
      setContent('');
      return;
    }

    setIsSaving(true);
    try {
      await fetch(`/api/annotations?id=${existingNote.id}&type=note`, { method: 'DELETE' });
      removeNote(existingNote.id);
      setIsEditing(false);
      setContent('');
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mt-6 border-t border-raw pt-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="type-label flex items-center gap-2">
          <Edit3 size={14} className="text-orange" /> Personal Note
        </h4>
        
        {!isEditing && existingNote && (
          <button onClick={() => setIsEditing(true)} className="btn-ghost !px-2 !py-1 text-xs">
            EDIT NOTE
          </button>
        )}
        {!isEditing && !existingNote && (
          <button onClick={() => setIsEditing(true)} className="btn-ghost !px-2 !py-1 text-xs text-orange border-orange hover:bg-orange/10">
            ADD NOTE
          </button>
        )}
      </div>

      <AnimatePresence>
        {isEditing ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="space-y-3"
          >
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-obsidian border border-orange text-primary type-body p-3 min-h-[100px] focus:outline-none focus:ring-1 focus:ring-orange"
              placeholder="Add your personal insights here..."
              autoFocus
              disabled={isSaving}
            />
            <div className="flex justify-end gap-2">
              <button 
                onClick={handleDelete}
                className="btn-icon text-muted hover:text-orange hover:border-orange"
                title="Delete note"
                disabled={isSaving}
              >
                <Trash2 size={14} />
              </button>
              <button 
                onClick={() => {
                  setIsEditing(false);
                  setContent(existingNote?.content || '');
                }}
                className="btn-ghost !px-2 !py-1"
                disabled={isSaving}
              >
                <X size={14} /> CANCEL
              </button>
              <button 
                onClick={handleSave}
                className="btn-primary !px-3 !py-1 bg-orange"
                disabled={isSaving}
              >
                <Check size={14} className="text-obsidian" /> SAVE
              </button>
            </div>
          </motion.div>
        ) : existingNote ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="annotation-note"
          >
            {existingNote.content}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
