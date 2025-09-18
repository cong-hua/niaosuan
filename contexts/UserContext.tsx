'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

type Gender = 'male' | 'female';

interface UserContextType {
  gender: Gender;
  setGender: (gender: Gender) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [gender, setGender] = useState<Gender>('male');

  return (
    <UserContext.Provider value={{ gender, setGender }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}