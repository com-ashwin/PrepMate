import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  User,
  Session,
  MentorSection,
  DepthLevel,
  ResearchSource,
  Bookmark,
  Note,
  Highlight,
  HighlightColor,
} from './types';

// ============================================
// USER STORE
// ============================================
interface UserState {
  user: User | null;
  setUser: (user: User) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null }),
    }),
    { name: 'prepmate-user' }
  )
);

// ============================================
// SESSION STORE
// ============================================
interface SessionState {
  activeSession: Session | null;
  sections: MentorSection[];
  isStreaming: boolean;
  streamProgress: number;
  currentSectionType: string | null;
  researchSource: ResearchSource;
  error: string | null;

  setActiveSession: (session: Session) => void;
  addSection: (section: MentorSection) => void;
  updateSection: (id: string, content: string) => void;
  setStreaming: (streaming: boolean) => void;
  setStreamProgress: (progress: number) => void;
  setCurrentSection: (type: string | null) => void;
  setResearchSource: (source: ResearchSource) => void;
  setError: (error: string | null) => void;
  resetSession: () => void;
}

export const useSessionStore = create<SessionState>()((set) => ({
  activeSession: null,
  sections: [],
  isStreaming: false,
  streamProgress: 0,
  currentSectionType: null,
  researchSource: 'topic',
  error: null,

  setActiveSession: (session) => set({ activeSession: session }),
  addSection: (section) =>
    set((state) => ({ sections: [...state.sections, section] })),
  updateSection: (id, content) =>
    set((state) => ({
      sections: state.sections.map((s) =>
        s.id === id ? { ...s, content: s.content + content } : s
      ),
    })),
  setStreaming: (streaming) => set({ isStreaming: streaming }),
  setStreamProgress: (progress) => set({ streamProgress: progress }),
  setCurrentSection: (type) => set({ currentSectionType: type }),
  setResearchSource: (source) => set({ researchSource: source }),
  setError: (error) => set({ error }),
  resetSession: () =>
    set({
      activeSession: null,
      sections: [],
      isStreaming: false,
      streamProgress: 0,
      currentSectionType: null,
      error: null,
    }),
}));

// ============================================
// ANNOTATION STORE
// ============================================
interface AnnotationState {
  bookmarks: Bookmark[];
  notes: Note[];
  highlights: Highlight[];
  selectedHighlightColor: HighlightColor;

  setBookmarks: (bookmarks: Bookmark[]) => void;
  addBookmark: (bookmark: Bookmark) => void;
  removeBookmark: (id: string) => void;
  isBookmarked: (sectionId: string) => boolean;

  setNotes: (notes: Note[]) => void;
  addNote: (note: Note) => void;
  updateNote: (id: string, content: string) => void;
  removeNote: (id: string) => void;
  getNoteForSection: (sectionId: string) => Note | undefined;

  setHighlights: (highlights: Highlight[]) => void;
  addHighlight: (highlight: Highlight) => void;
  removeHighlight: (id: string) => void;
  getHighlightsForSection: (sectionId: string) => Highlight[];
  setHighlightColor: (color: HighlightColor) => void;
}

export const useAnnotationStore = create<AnnotationState>()((set, get) => ({
  bookmarks: [],
  notes: [],
  highlights: [],
  selectedHighlightColor: 'yellow',

  setBookmarks: (bookmarks) => set({ bookmarks }),
  addBookmark: (bookmark) =>
    set((state) => ({ bookmarks: [...state.bookmarks, bookmark] })),
  removeBookmark: (id) =>
    set((state) => ({ bookmarks: state.bookmarks.filter((b) => b.id !== id) })),
  isBookmarked: (sectionId) =>
    get().bookmarks.some((b) => b.sectionId === sectionId),

  setNotes: (notes) => set({ notes }),
  addNote: (note) => set((state) => ({ notes: [...state.notes, note] })),
  updateNote: (id, content) =>
    set((state) => ({
      notes: state.notes.map((n) => (n.id === id ? { ...n, content } : n)),
    })),
  removeNote: (id) =>
    set((state) => ({ notes: state.notes.filter((n) => n.id !== id) })),
  getNoteForSection: (sectionId) =>
    get().notes.find((n) => n.sectionId === sectionId),

  setHighlights: (highlights) => set({ highlights }),
  addHighlight: (highlight) =>
    set((state) => ({ highlights: [...state.highlights, highlight] })),
  removeHighlight: (id) =>
    set((state) => ({ highlights: state.highlights.filter((h) => h.id !== id) })),
  getHighlightsForSection: (sectionId) =>
    get().highlights.filter((h) => h.sectionId === sectionId),
  setHighlightColor: (color) => set({ selectedHighlightColor: color }),
}));

// ============================================
// UI STORE
// ============================================
interface UIState {
  sidebarOpen: boolean;
  historyOpen: boolean;
  onboardingComplete: boolean;
  activeDepth: DepthLevel;

  setSidebarOpen: (open: boolean) => void;
  setHistoryOpen: (open: boolean) => void;
  setOnboardingComplete: (done: boolean) => void;
  setActiveDepth: (depth: DepthLevel) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: false,
      historyOpen: false,
      onboardingComplete: false,
      activeDepth: 'Advanced',

      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setHistoryOpen: (open) => set({ historyOpen: open }),
      setOnboardingComplete: (done) => set({ onboardingComplete: done }),
      setActiveDepth: (depth) => set({ activeDepth: depth }),
    }),
    { name: 'prepmate-ui' }
  )
);
