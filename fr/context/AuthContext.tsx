'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { User, TouristPreferences, Role } from '@/types/ceylontour';
import { DEFAULT_TOURIST_PREFERENCES } from '@/lib/mockData';
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
import {
  listSavedDestinations,
  saveDestination,
  unsaveDestination,
} from '@/lib/engagement';
import type { SavedDestinationResponse } from '@/types/engagement-api';
import { getDestination } from '@/lib/destinations';

async function loadSavedDestinationRecords() {
  const items = await listSavedDestinations();
  return Promise.all(items.map(async (item) => ({
    ...item,
    destination: await getDestination(item.destination.id),
  })));
}

interface AuthContextType {
  user: User | null;
  role: Role;
  isLoading: boolean;
  savedDestinationIds: string[];
  savedDestinations: SavedDestinationResponse[];
  isSavedLoading: boolean;
  currentPreferences: TouristPreferences;
  isSaved: (destinationId: string | number) => boolean;
  toggleSaveDestination: (destinationId: number) => Promise<void>;
  updatePreferences: (newPrefs: Partial<TouristPreferences>) => void;
  login: (credentials: LoginCredentials) => Promise<User>;
  register: (credentials: RegisterCredentials) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_KEYS = {
  PREFS: 'ceylontour_user_preferences',
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [savedDestinations, setSavedDestinations] = useState<SavedDestinationResponse[]>([]);
  const [isSavedLoading, setIsSavedLoading] = useState(false);
  const pendingSavedMutations = React.useRef(new Set<number>());
  const currentUserId = React.useRef<number | undefined>(undefined);

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
    currentUserId.current = authenticatedUser.id;
    setSavedDestinations([]);
    setIsSavedLoading(true);
    setUser(authenticatedUser);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(authenticatedUser));
  }, []);

  const clearSession = React.useCallback(() => {
    currentUserId.current = undefined;
    clearStoredAuth();
    setSavedDestinations([]);
    setIsSavedLoading(false);
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
      if (active) clearSession();
    };

    window.addEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized);
    void restoreSession();

    return () => {
      active = false;
      window.removeEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized);
    };
  }, [clearSession, persistUser]);

  useEffect(() => {
    let active = true;
    if (!user) {
      return () => { active = false; };
    }
    loadSavedDestinationRecords()
      .then((items) => {
        if (active) setSavedDestinations(items);
      })
      .catch(() => {
        if (active) toast.error('Unable to load your saved destinations.');
      })
      .finally(() => {
        if (active) setIsSavedLoading(false);
      });
    return () => { active = false; };
  }, [user]);

  const savedDestinationIds = savedDestinations.map((item) => item.destination.slug);

  const isSaved = React.useCallback((destinationId: string | number) => {
    return savedDestinations.some((item) =>
      typeof destinationId === 'number'
        ? item.destination.id === destinationId
        : item.destination.slug === destinationId,
    );
  }, [savedDestinations]);

  const toggleSaveDestination = React.useCallback(async (destinationId: number) => {
    const actingUserId = user?.id;
    if (!actingUserId) return;
    if (pendingSavedMutations.current.has(destinationId)) return;
    pendingSavedMutations.current.add(destinationId);
    try {
      const existing = savedDestinations.find((item) => item.destination.id === destinationId);
      if (existing) {
        await unsaveDestination(destinationId);
        if (currentUserId.current !== actingUserId) return;
        setSavedDestinations((items) => items.filter((item) => item.destination.id !== destinationId));
      } else {
        const saved = await saveDestination(destinationId);
        if (currentUserId.current !== actingUserId) return;
        if (saved) {
          const enriched = {
            ...saved,
            destination: await getDestination(saved.destination.id),
          };
          if (currentUserId.current !== actingUserId) return;
          setSavedDestinations((items) => [enriched, ...items.filter((item) => item.destination.id !== destinationId)]);
        } else {
          const refreshed = await loadSavedDestinationRecords();
          if (currentUserId.current !== actingUserId) return;
          setSavedDestinations(refreshed);
        }
      }
    } catch {
      if (currentUserId.current === actingUserId) {
        toast.error('Unable to update this saved destination. Please try again.');
      }
    } finally {
      pendingSavedMutations.current.delete(destinationId);
    }
  }, [savedDestinations, user?.id]);

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
        savedDestinations,
        isSavedLoading,
        currentPreferences,
        isSaved,
        toggleSaveDestination,
        updatePreferences,
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
