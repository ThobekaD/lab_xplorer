import { create } from 'zustand';
import { Experiment, NotebookEntry, Game, LeaderboardEntry } from '@/types';

interface AppState {
  // Experiments
  experiments: Experiment[];
  currentExperiment: Experiment | null;
  setExperiments: (experiments: Experiment[]) => void;
  setCurrentExperiment: (experiment: Experiment | null) => void;

  // Notebook
  notebookEntries: NotebookEntry[];
  currentEntry: NotebookEntry | null;
  setNotebookEntries: (entries: NotebookEntry[]) => void;
  setCurrentEntry: (entry: NotebookEntry | null) => void;

  // Games
  games: Game[];
  setGames: (games: Game[]) => void;

  // Leaderboard
  leaderboard: LeaderboardEntry[];
  setLeaderboard: (leaderboard: LeaderboardEntry[]) => void;

  // UI State
  sidebarOpen: boolean;
  theme: 'light' | 'dark' | 'system';
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;

  // Collaboration
  collaborators: string[];
  setCollaborators: (collaborators: string[]) => void;

  // Notifications
  notifications: any[];
  setNotifications: (notifications: any[]) => void;
  markNotificationRead: (id: string) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Experiments
  experiments: [],
  currentExperiment: null,
  setExperiments: (experiments) => set({ experiments }),
  setCurrentExperiment: (experiment) => set({ currentExperiment: experiment }),

  // Notebook
  notebookEntries: [],
  currentEntry: null,
  setNotebookEntries: (entries) => set({ notebookEntries: entries }),
  setCurrentEntry: (entry) => set({ currentEntry: entry }),

  // Games
  games: [],
  setGames: (games) => set({ games }),

  // Leaderboard
  leaderboard: [],
  setLeaderboard: (leaderboard) => set({ leaderboard }),

  // UI State
  sidebarOpen: false,
  theme: 'system',
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setTheme: (theme) => set({ theme }),

  // Collaboration
  collaborators: [],
  setCollaborators: (collaborators) => set({ collaborators }),

  // Notifications
  notifications: [],
  setNotifications: (notifications) => set({ notifications }),
  markNotificationRead: (id) => {
    const { notifications } = get();
    const updated = notifications.map(n => 
      n.id === id ? { ...n, is_read: true } : n
    );
    set({ notifications: updated });
  },
}));