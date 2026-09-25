'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, TouristPreferences, SearchHistoryItem, Role } from '@/types/ceylontour';
import { DEFAULT_TOURIST_PREFERENCES, MOCK_SEARCH_HISTORY } from '@/lib/mockData';
import {
  AUTH_TOKEN_KEY,
  AUTH_USER_KEY,
  clearStoredAuth,
  getCurrentUser,
  login as loginRequest,
  LoginCredentials,
  register as registerRequest,
  RegisterCredentials,
  storeAccessToken,
} from '@/lib/auth';
import { AUTH_UNAUTHORIZED_EVENT } from '@/lib/axiosInstance';

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
  login: (credentials: LoginCredentials) => Promise<User>;
  register: (credentials: RegisterCredentials) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_KEYS = {
  SAVED: 'ceylontour_saved_destinations',
  HISTORY: 'ceylontour_search_history',
  PREFS: 'ceylontour_user_preferences',
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
    if (typeof window === 'undefined') return DEFAULT_TOURIST_PREFERENCES;
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PREFS);
      return stored ? JSON.parse(stored) : DEFAULT_TOURIST_PREFERENCES;
    } catch {
      return DEFAULT_TOURIST_PREFERENCES;
    }
  });

  const persistUser = React.useCallback((authenticatedUser: User) => {
    setUser(authenticatedUser);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(authenticatedUser));
  }, []);

  const clearSession = React.useCallback(() => {
    clearStoredAuth();
    setUser(null);
  }, []);

  useEffect(() => {
    let active = true;

    const restoreSession = async () => {
      if (!localStorage.getItem(AUTH_TOKEN_KEY)) {
        setIsLoading(false);
        return;
      }

      try {
        const currentUser = await getCurrentUser();
        if (active) persistUser(currentUser);
      } catch {
        if (active) clearSession();
      } finally {
        if (active) setIsLoading(false);
      }
    };

    const handleUnauthorized = () => {
      if (active) setUser(null);
    };

    window.addEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized);
    void restoreSession();

    return () => {
      active = false;
      window.removeEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized);
    };
  }, [clearSession, persistUser]);

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

  const updatePreferences = React.useCallback((newPrefs: Partial<TouristPreferences>) => {
    setCurrentPreferences((prev) => {
      const updated = { ...prev, ...newPrefs };
      try {
        localStorage.setItem(STORAGE_KEYS.PREFS, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  }, []);

  const addSearchHistory = React.useCallback((item: Omit<SearchHistoryItem, 'id' | 'date'>) => {
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
  }, []);

  const login = React.useCallback(async (credentials: LoginCredentials) => {
    const token = await loginRequest(credentials);
    storeAccessToken(token.access_token);

    try {
      const currentUser = await getCurrentUser();
      persistUser(currentUser);
      return currentUser;
    } catch (error) {
      clearSession();
      throw error;
    }
  }, [clearSession, persistUser]);

  const register = React.useCallback(async (credentials: RegisterCredentials) => {
    await registerRequest(credentials);
    return login(credentials);
  }, [login]);

  const logout = React.useCallback(() => {
    clearSession();
  }, [clearSession]);

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || 'TOURIST',
        isLoading,
        savedDestinationIds,
        searchHistory,
        currentPreferences,
        isSaved,
        toggleSaveDestination,
        updatePreferences,
        addSearchHistory,
        login,
        register,
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
