/**
 * SynapseOS Mobile — AuthContext
 * Manages active patient ABHA profile, switching between verified citizen profiles,
 * and sandbox guest status.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PatientProfile } from '../types';
import { MOCK_PATIENT_PROFILES, DEFAULT_PATIENT_PROFILE } from '../data/mockProfiles';
import { SecureStorage } from '../storage/secureStorage';

interface AuthContextType {
  activeProfile: PatientProfile;
  allProfiles: PatientProfile[];
  switchProfileById: (profileId: string) => Promise<void>;
  updateActiveProfile: (updated: Partial<PatientProfile>) => void;
  isSandbox: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeProfile, setActiveProfile] = useState<PatientProfile>(DEFAULT_PATIENT_PROFILE);
  const [allProfiles, setAllProfiles] = useState<PatientProfile[]>(MOCK_PATIENT_PROFILES);

  useEffect(() => {
    SecureStorage.getActiveProfileId(DEFAULT_PATIENT_PROFILE.profileId).then(id => {
      const match = allProfiles.find(p => p.profileId === id);
      if (match) {
        setActiveProfile(match);
      }
    });
  }, [allProfiles]);

  const switchProfileById = async (profileId: string) => {
    const match = allProfiles.find(p => p.profileId === profileId);
    if (match) {
      setActiveProfile(match);
      await SecureStorage.setActiveProfileId(profileId);
    }
  };

  const updateActiveProfile = (updated: Partial<PatientProfile>) => {
    setActiveProfile(prev => {
      const merged = { ...prev, ...updated };
      setAllProfiles(profiles =>
        profiles.map(p => (p.profileId === merged.profileId ? merged : p))
      );
      return merged;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        activeProfile,
        allProfiles,
        switchProfileById,
        updateActiveProfile,
        isSandbox: true
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
