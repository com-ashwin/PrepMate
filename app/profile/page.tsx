'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Nav } from '@/components/ui/Nav';
import { formatRelativeTime } from '@/lib/utils';
import Link from 'next/link';
import { Terminal, Clock, Bookmark, ArrowRight, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProfilePage() {
  const { data, isLoading } = useQuery({
    queryKey: ['history'],
    queryFn: async () => {
      const res = await fetch('/api/history');
      const json = await res.json();
      return json.data || [];
    },
  });

  return (
    <div className="min-h-screen flex flex-col bg-obsidian">
      <Nav />
      
      <main className="flex-1 max-w-5xl w-full mx-auto p-6 py-12">
        <div className="space-y-12">
          
          <header className="border-b border-raw pb-6 flex items-end justify-between">
            <div>
              <h1 className="type-h2 uppercase">Operative Profile</h1>
              <p className="type-mono text-secondary mt-2">ID: ANONYMOUS-USER-001</p>
            </div>
            <div className="text-right hidden sm:block">
              <div className="type-mono text-xl text-accent">{data?.length || 0}</div>
              <div className="type-label text-muted">SESSIONS INITIATED</div>
            </div>
          </header>

          <section>
            <div className="flex items-center gap-2 mb-6">
              <Activity className="text-accent" size={20} />
              <h2 className="type-h3 uppercase tracking-wider">Session Log</h2>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-12">
                <Terminal className="text-accent animate-pulse-glow" size={32} />
              </div>
            ) : data?.length === 0 ? (
              <div className="panel border-raw text-center py-12 text-secondary">
                <p className="type-mono mb-4">NO ACTIVITY RECORDS FOUND</p>
                <Link href="/study" className="btn-primary">
                  INITIATE FIRST SESSION
                </Link>
              </div>
            ) : (
              <div className="grid gap-4">
                {data?.map((session: any, i: number) => (
                  <motion.div 
                    key={session.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="panel hover:border-accent transition-colors group relative overflow-hidden"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-raw group-hover:bg-accent transition-colors"></div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pl-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <span className="tag tag-yellow">{session.depth}</span>
                          <span className="type-mono text-xs text-muted flex items-center gap-1">
                            <Clock size={12} />
                            {formatRelativeTime(session.createdAt)}
                          </span>
                        </div>
                        <h3 className="type-h3 truncate max-w-[600px]">{session.topic}</h3>
                        
                        <div className="flex items-center gap-4 text-secondary">
                          <span className="type-mono text-xs flex items-center gap-1">
                            <Bookmark size={12} />
                            {session._count?.bookmarks || 0} Bookmarks
                          </span>
                        </div>
                      </div>
                      
                      <Link 
                        href={`/session/${session.id}`}
                        className="btn-ghost shrink-0 w-fit"
                      >
                        REVIEW <ArrowRight size={16} />
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </section>

        </div>
      </main>
    </div>
  );
}
