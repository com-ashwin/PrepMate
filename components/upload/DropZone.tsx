'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, File as FileIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ParsedFile } from '@/lib/types';
import { motion } from 'framer-motion';

interface DropZoneProps {
  onFileParsed: (parsed: ParsedFile) => void;
}

export function DropZone({ onFileParsed }: DropZoneProps) {
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setIsParsing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/parse', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (data.success && data.data) {
        onFileParsed(data.data);
      } else {
        throw new Error(data.error || 'Failed to parse file');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during parsing');
    } finally {
      setIsParsing(false);
    }
  }, [onFileParsed]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt', '.md', '.csv'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={cn(
          "relative border-2 border-dashed p-12 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300",
          isDragActive ? "border-accent bg-accent/5" : "border-raw hover:border-muted bg-obsidian",
          isDragReject ? "border-orange bg-orange/5" : "",
          isParsing ? "opacity-50 pointer-events-none" : ""
        )}
      >
        <input {...getInputProps()} />
        
        {isParsing ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-4 text-accent"
          >
            <Loader2 size={32} className="animate-spin" />
            <p className="type-mono text-sm font-bold tracking-widest">PARSING DOCUMENT...</p>
          </motion.div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className={cn(
              "p-4 rounded-none border",
              isDragActive ? "border-accent text-accent" : "border-raw text-secondary"
            )}>
              <UploadCloud size={32} />
            </div>
            
            <div>
              <p className="type-h3 mb-2">
                {isDragActive ? "Drop to initialize parsing" : "Upload Syllabus or Notes"}
              </p>
              <p className="type-body text-secondary text-sm">
                Drag & drop or click to select a file.<br/>
                Supports PDF, DOCX, TXT, MD up to 10MB.
              </p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 p-3 border border-orange bg-hl-orange text-orange type-mono text-sm">
          ⚠️ {error}
        </div>
      )}
    </div>
  );
}
