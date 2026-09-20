/**
 * SynapseOS Mobile — Verified Mock Health Profiles
 * Reused directly from frontend/src/data/mockHealthProfiles
 */

import { PatientProfile } from '../types';

export const MOCK_PATIENT_PROFILES: PatientProfile[] = [
  {
    profileId: 'mausam_kar_verified_abha',
    name: 'Mausam Kar',
    age: 24,
    gender: 'Male',
    dob: 'April 14, 2002',
    yearOfBirth: 2002,
    bloodType: 'B+',
    abhaId: '91-7294-8102-5309',
    abhaAddress: 'mausamkar@abdm',
    policyNumber: 'PM-JAY-2026-IND-8841',
    linkedHip: 'AIIMS - Central Node, New Delhi',
    stateCode: 'DL',
    avatarImageKey: 'mausam_kar.jpg',
    isSandbox: true
  },
  {
    profileId: 'rachit_tiwari_verified_abha',
    name: 'Rachit Tiwari',
    age: 23,
    gender: 'Male',
    dob: 'November 22, 2003',
    yearOfBirth: 2003,
    bloodType: 'O+',
    abhaId: '91-3819-4021-9871',
    abhaAddress: 'rachit.tiwari@abdm',
    policyNumber: 'PM-JAY-2026-UP-1029',
    linkedHip: 'KGMU Lucknow Trauma & Clinical Centre',
    stateCode: 'UP',
    avatarImageKey: 'rachit_tiwari.jpg',
    isSandbox: true
  },
  {
    profileId: 'mangal_singh_verified_abha',
    name: 'Mangal Singh',
    age: 58,
    gender: 'Male',
    dob: 'August 15, 1968',
    yearOfBirth: 1968,
    bloodType: 'A+',
    abhaId: '91-1029-5839-2041',
    abhaAddress: 'mangal.singh@abdm',
    policyNumber: 'PM-JAY-2026-PB-4402',
    linkedHip: 'Civil Hospital Amritsar, Punjab',
    stateCode: 'PB',
    avatarImageKey: 'mangal_singh.jpg',
    isSandbox: true
  },
  {
    profileId: 'surabhi_verified_abha',
    name: 'Surabhi Kumari',
    age: 27,
    gender: 'Female',
    dob: 'May 10, 1999',
    yearOfBirth: 1999,
    bloodType: 'AB+',
    abhaId: '91-6482-1940-3382',
    abhaAddress: 'surabhi.kumari@abdm',
    policyNumber: 'PM-JAY-2026-BR-9912',
    linkedHip: 'Patna Medical College Hospital (PMCH)',
    stateCode: 'BR',
    avatarImageKey: 'surabhi.jpg',
    isSandbox: true
  },
  {
    profileId: 'shaikh_warsi_verified_abha',
    name: 'Shaikh Warsi',
    age: 34,
    gender: 'Male',
    dob: 'January 05, 1992',
    yearOfBirth: 1992,
    bloodType: 'B-',
    abhaId: '91-4491-8201-7734',
    abhaAddress: 'shaikh.warsi@abdm',
    policyNumber: 'PM-JAY-2026-MH-3389',
    linkedHip: 'King Edward Memorial (KEM) Hospital, Mumbai',
    stateCode: 'MH',
    avatarImageKey: 'shaikh_warsi.jpg',
    isSandbox: true
  },
  {
    profileId: 'jiya_jaiswal_verified_abha',
    name: 'Jiya Jaiswal',
    age: 21,
    gender: 'Female',
    dob: 'July 19, 2005',
    yearOfBirth: 2005,
    bloodType: 'O-',
    abhaId: '91-8820-3194-5501',
    abhaAddress: 'jiya.jaiswal@abdm',
    policyNumber: 'PM-JAY-2026-WB-7104',
    linkedHip: 'Calcutta Medical College & Hospital',
    stateCode: 'WB',
    avatarImageKey: 'jiya_jaiswal.jpg',
    isSandbox: true
  }
];

export const DEFAULT_PATIENT_PROFILE = MOCK_PATIENT_PROFILES[0];
