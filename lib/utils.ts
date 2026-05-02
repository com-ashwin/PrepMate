import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Merge Tailwind + clsx classes */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a date to relative time (e.g., "2 hours ago") */
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 7) return new Date(date).toLocaleDateString();
  if (days > 1) return `${days} days ago`;
  if (days === 1) return 'Yesterday';
  if (hours > 1) return `${hours} hours ago`;
  if (hours === 1) return '1 hour ago';
  if (minutes > 1) return `${minutes} minutes ago`;
  return 'Just now';
}

/** Generate avatar initials from a name */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/** Generate a deterministic avatar color from a name */
export function getAvatarColor(name: string): string {
  const colors = ['#E8FF00', '#FF3B00', '#00FF87', '#FF6B00', '#00D4FF'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

/** Truncate a string to a given length */
export function truncate(str: string, len: number): string {
  if (str.length <= len) return str;
  return str.slice(0, len) + '…';
}

/** Slugify a string */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/** Parse a markdown report into sections */
export function parseMentorSections(report: string): Array<{
  id: string;
  type: string;
  title: string;
  content: string;
  order: number;
}> {
  const sectionPatterns = [
    { type: 'brief', pattern: /##?\s*BRIEF|Executive Summary/i },
    { type: 'core_concepts', pattern: /##?\s*CORE CONCEPTS|Key Concepts/i },
    { type: 'deep_dive', pattern: /##?\s*DEEP DIVE|In.Depth/i },
    { type: 'common_mistakes', pattern: /##?\s*COMMON MISTAKES|Common Errors/i },
    { type: 'interview_qa', pattern: /##?\s*INTERVIEW Q&A|Interview Questions/i },
    { type: 'practice', pattern: /##?\s*PRACTICE|Exercises/i },
    { type: 'mastery_checklist', pattern: /##?\s*MASTERY CHECKLIST|Self.Assessment/i },
  ];

  const lines = report.split('\n');
  const sections: Array<{
    id: string;
    type: string;
    title: string;
    content: string;
    order: number;
  }> = [];

  let currentSection: typeof sections[0] | null = null;
  let order = 0;

  for (const line of lines) {
    let matched = false;
    for (const { type, pattern } of sectionPatterns) {
      if (pattern.test(line)) {
        if (currentSection) {
          sections.push({ ...currentSection, content: currentSection.content.trim() });
        }
        currentSection = {
          id: `section-${type}-${order}`,
          type,
          title: line.replace(/^#+\s*/, ''),
          content: '',
          order: order++,
        };
        matched = true;
        break;
      }
    }
    if (!matched && currentSection) {
      currentSection.content += line + '\n';
    }
  }

  if (currentSection) {
    sections.push({ ...currentSection, content: currentSection.content.trim() });
  }

  // Fallback: if no sections parsed, return full report as one
  if (sections.length === 0) {
    sections.push({
      id: 'section-full',
      type: 'deep_dive',
      title: 'Research Report',
      content: report.trim(),
      order: 0,
    });
  }

  return sections;
}

/** Estimate reading time in minutes */
export function estimateReadingTime(text: string): number {
  const words = text.split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

/** Format section type to readable label */
export function sectionTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    brief: 'BRIEF',
    core_concepts: 'CORE CONCEPTS',
    deep_dive: 'DEEP DIVE',
    common_mistakes: 'COMMON MISTAKES',
    interview_qa: 'INTERVIEW Q&A',
    practice: 'PRACTICE',
    mastery_checklist: 'MASTERY CHECKLIST',
  };
  return labels[type] ?? type.toUpperCase().replace(/_/g, ' ');
}

/** Section accent colors */
export function sectionAccentColor(type: string): string {
  const colors: Record<string, string> = {
    brief: '#E8FF00',
    core_concepts: '#00FF87',
    deep_dive: '#E8FF00',
    common_mistakes: '#FF3B00',
    interview_qa: '#FF6B00',
    practice: '#00D4FF',
    mastery_checklist: '#00FF87',
  };
  return colors[type] ?? '#E8FF00';
}

/** Format bytes to human-readable */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
