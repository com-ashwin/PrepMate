'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { FloatingCard } from '@/components/3d/FloatingCard';
import { Terminal, Brain, Target, ArrowRight } from 'lucide-react';
import { Nav } from '@/components/ui/Nav';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <Nav />
      
      {/* Background depth layers */}
      <div className="absolute inset-0 z-0 pointer-events-none perspective-far">
        <motion.div 
          className="absolute top-20 left-10 w-[40vw] h-[40vh] border border-raw opacity-30 depth-layer-1"
          animate={{ rotate: 360 }}
          transition={{ duration: 150, repeat: Infinity, ease: "linear" }}
        />
        <motion.div 
          className="absolute bottom-20 right-10 w-[30vw] h-[50vh] border border-accent opacity-10 depth-layer-2"
          animate={{ rotate: -360 }}
          transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
        />
      </div>

      <main className="flex-1 flex flex-col items-center justify-center relative z-10 px-6 py-20">
        <div className="max-w-5xl w-full mx-auto space-y-16">
          
          {/* Typographic Brutalist Hero */}
          <div className="text-center space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="inline-flex items-center gap-2 tag tag-yellow mb-4"
            >
              <Terminal size={12} />
              <span>v1.0 / SYSTEM ACTIVE</span>
            </motion.div>

            <motion.h1 
              className="type-hero text-transparent bg-clip-text bg-gradient-to-b from-white to-neutral-500 uppercase"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
            >
              Master Any<br />
              <span className="text-accent">Topic.</span>
            </motion.h1>

            <motion.p 
              className="type-body text-secondary max-w-2xl mx-auto text-lg md:text-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              PrepMate is your super-strict, highly structured AI mentor. 
              No fluff. No chat. Just pure, production-grade learning density 
              designed for FAANG-level interview readiness.
            </motion.p>

            <motion.div 
              className="pt-8 flex items-center justify-center gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <Link href="/study" className="btn-primary group">
                INITIATE SESSION
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>

          {/* 3D Value Proposition Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
              <FloatingCard className="panel h-full flex flex-col gap-4">
                <div className="w-12 h-12 rounded-none bg-hl-yellow flex items-center justify-center border border-accent">
                  <Brain className="text-accent" size={24} />
                </div>
                <h3 className="type-h3 uppercase">Deep Research</h3>
                <p className="type-body text-secondary">
                  Powered by multi-agent web scraping. We build comprehensive study guides from the most reliable sources on the internet.
                </p>
              </FloatingCard>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
              <FloatingCard className="panel border-orange h-full flex flex-col gap-4">
                <div className="w-12 h-12 rounded-none bg-hl-orange flex items-center justify-center border border-orange">
                  <Target className="text-orange" size={24} />
                </div>
                <h3 className="type-h3 uppercase">Interview Ready</h3>
                <p className="type-body text-secondary">
                  We don't just explain concepts. We highlight common mistakes and simulate real, graded interview questions.
                </p>
              </FloatingCard>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
              <FloatingCard className="panel border-green h-full flex flex-col gap-4">
                <div className="w-12 h-12 rounded-none bg-hl-green flex items-center justify-center border border-green">
                  <Terminal className="text-green" size={24} />
                </div>
                <h3 className="type-h3 uppercase">File Parsing</h3>
                <p className="type-body text-secondary">
                  Upload PDF, DOCX, or markdown syllabuses. The mentor extracts subtopics and builds a structured curriculum.
                </p>
              </FloatingCard>
            </motion.div>
          </div>

        </div>
      </main>
    </div>
  );
}
