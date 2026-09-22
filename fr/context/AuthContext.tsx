'use client';

import React, { createContext, useContext, useState } from 'react';
import { User, TouristPreferences, SearchHistoryItem, Role } from '@/types/ceylontour';
import { DEFAULT_USER, MOCK_SEARCH_HISTORY } from '@/lib/mockData';

interface AuthContextType {
  user: User | null;
  role: Role;
  isLoading: boolean;
  savedDestinationIds: string[];
  searchHistory: SearchHistoryItem[];
  currentPreferences: TouristPreferences;
  isSaved: (destinationId: string) => boolean;
  toggleSaveDestination: (destinationId: string) => void;
  updatePreferences: (newPrefs: Partial<TouristPreferences>) => void;
  addSearchHistory: (item: Omit<SearchHistoryItem, 'id' | 'date'>) => void;
  loginAs: (role: Role) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_KEYS = {
  USER: 'ceylontour_user',
  SAVED: 'ceylontour_saved_destinations',
  HISTORY: 'ceylontour_search_history',
  PREFS: 'ceylontour_user_preferences',
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === 'undefined') return DEFAULT_USER;
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USER);
      return stored ? JSON.parse(stored) : DEFAULT_USER;
    } catch {
      return DEFAULT_USER;
    }
  });

  const [savedDestinationIds, setSavedDestinationIds] = useState<string[]>(() => {
    if (typeof window === 'undefined') return ['belihuloya', 'haputale'];
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SAVED);
      return stored ? JSON.parse(stored) : ['belihuloya', 'haputale'];
    } catch {
      return ['belihuloya', 'haputale'];
    }
  });

  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>(() => {
    if (typeof window === 'undefined') return MOCK_SEARCH_HISTORY;
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.HISTORY);
      return stored ? JSON.parse(stored) : MOCK_SEARCH_HISTORY;
    } catch {
      return MOCK_SEARCH_HISTORY;
    }
  });

  const [currentPreferences, setCurrentPreferences] = useState<TouristPreferences>(() => {
    if (typeof window === 'undefined') return DEFAULT_USER.preferences;
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PREFS);
      return stored ? JSON.parse(stored) : DEFAULT_USER.preferences;
    } catch {
      return DEFAULT_USER.preferences;
    }
  });

  const isSaved = (destinationId: string) => {
    return savedDestinationIds.includes(destinationId);
  };

  const toggleSaveDestination = (destinationId: string) => {
    setSavedDestinationIds((prev) => {
      const next = prev.includes(destinationId)
        ? prev.filter((id) => id !== destinationId)
        : [...prev, destinationId];
      try {
        localStorage.setItem(STORAGE_KEYS.SAVED, JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  };

  const updatePreferences = (newPrefs: Partial<TouristPreferences>) => {
    setCurrentPreferences((prev) => {
      const updated = { ...prev, ...newPrefs };
      try {
        localStorage.setItem(STORAGE_KEYS.PREFS, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  const addSearchHistory = (item: Omit<SearchHistoryItem, 'id' | 'date'>) => {
    const newItem: SearchHistoryItem = {
      ...item,
      id: `hist_${Date.now()}`,
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
    };

    setSearchHistory((prev) => {
      const updated = [newItem, ...prev.slice(0, 9)];
      try {
        localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  const loginAs = (role: Role) => {
    const newUser: User = {
      ...DEFAULT_USER,
      role,
      name: role === 'ADMIN' ? 'Tourism Authority Officer' : 'Nipun',
    };
    setUser(newUser);
    try {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
    } catch (e) {
      console.error(e);
    }
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem(STORAGE_KEYS.USER);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || 'TOURIST',
        isLoading: false,
        savedDestinationIds,
        searchHistory,
        currentPreferences,
        isSaved,
        toggleSaveDestination,
        updatePreferences,
        addSearchHistory,
        loginAs,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
