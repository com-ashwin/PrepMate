'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Terminal, User as UserIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/lib/store';

export function Nav() {
  const pathname = usePathname();
  const setHistoryOpen = useUIStore((s) => s.setHistoryOpen);

  return (
    <header className="w-full border-b border-raw bg-obsidian/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-accent flex items-center justify-center border border-accent group-hover:bg-transparent transition-colors">
            <Terminal className="text-obsidian group-hover:text-accent transition-colors" size={18} />
          </div>
          <span className="type-mono font-bold tracking-wider text-lg uppercase">PrepMate</span>
        </Link>

        {/* Links */}
        <nav className="hidden md:flex items-center gap-6">
          <Link 
            href="/study" 
            className={cn(
              "type-label hover:text-accent transition-colors",
              pathname === '/study' ? "text-accent" : "text-secondary"
            )}
          >
            Study Workspace
          </Link>
          <Link 
            href="/profile" 
            className={cn(
              "type-label hover:text-accent transition-colors",
              pathname === '/profile' ? "text-accent" : "text-secondary"
            )}
          >
            Profile & History
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setHistoryOpen(true)}
            className="btn-ghost !px-3 !py-1.5"
            title="Open History Drawer"
          >
            <span className="type-label hidden md:inline">History</span>
            <Terminal size={14} className="md:hidden" />
          </button>
          
          <Link href="/profile" className="btn-icon">
            <UserIcon size={16} />
          </Link>
        </div>

      </div>
    </header>
  );
}
