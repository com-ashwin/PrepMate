// ============================================
// CORE TYPES — PrepMate
// ============================================

export type DepthLevel = 'Beginner' | 'Advanced' | 'Interview-Ready';
export type SessionStatus = 'researching' | 'complete' | 'error';
export type HighlightColor = 'yellow' | 'orange' | 'green';
export type ResearchSource = 'topic' | 'file';

// ============================================
// USER
// ============================================
export interface User {
  id: string;
  name: string;
  avatar?: string;
  createdAt: Date;
}

export interface UserProfile extends User {
  sessionCount: number;
  topicsStudied: string[];
  bookmarkCount: number;
}

// ============================================
// SESSION
// ============================================
export interface Session {
  id: string;
  userId: string;
  topic: string;
  depth: DepthLevel;
  source: ResearchSource;
  fileName?: string;
  status: SessionStatus;
  report?: string;
  sections?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SessionWithAnnotations extends Session {
  bookmarks: Bookmark[];
  notes: Note[];
  highlights: Highlight[];
}

// ============================================
// MENTOR OUTPUT STRUCTURE
// ============================================
export interface MentorSection {
  id: string;
  type: SectionType;
  title: string;
  content: string;
  order: number;
}

export type SectionType =
  | 'brief'
  | 'core_concepts'
  | 'deep_dive'
  | 'common_mistakes'
  | 'interview_qa'
  | 'practice'
  | 'mastery_checklist';

export interface InterviewQA {
  question: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  answer: string;
  tags: string[];
}

export interface PracticeItem {
  title: string;
  description: string;
  hint?: string;
}

export interface MasteryCheckItem {
  id: string;
  text: string;
  checked: boolean;
}

// ============================================
// ANNOTATIONS
// ============================================
export interface Bookmark {
  id: string;
  userId: string;
  sessionId: string;
  sectionId: string;
  sectionTitle: string;
  createdAt: Date;
}

export interface Note {
  id: string;
  userId: string;
  sessionId: string;
  sectionId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Highlight {
  id: string;
  userId: string;
  sessionId: string;
  sectionId: string;
  text: string;
  color: HighlightColor;
  startOffset: number;
  endOffset: number;
  createdAt: Date;
}

// ============================================
// RESEARCH ENGINE
// ============================================
export interface ResearchRequest {
  topic: string;
  depth: DepthLevel;
  sessionId: string;
  userId: string;
  additionalContext?: string;
}

export interface ResearchStreamChunk {
  type: 'content' | 'section_start' | 'section_end' | 'complete' | 'error';
  sectionType?: SectionType;
  content?: string;
  error?: string;
}

export interface FallbackResearchResponse {
  content: string;
  source: 'tavily' | 'openai';
  sections: MentorSection[];
}

// ============================================
// FILE UPLOAD
// ============================================
export interface ParsedFile {
  name: string;
  type: string;
  topics: string[];
  rawContent: string;
  topicCount: number;
}

export interface FileParseError {
  code: 'UNSUPPORTED_FORMAT' | 'PARSE_ERROR' | 'TOO_LARGE' | 'EMPTY';
  message: string;
}

// ============================================
// API RESPONSES
// ============================================
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface SessionListItem {
  id: string;
  topic: string;
  depth: DepthLevel;
  source: ResearchSource;
  status: SessionStatus;
  createdAt: Date;
  bookmarkCount: number;
  noteCount: number;
}
