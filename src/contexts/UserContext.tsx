import { User } from '@/api/types';
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface UserContextProps {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextProps | undefined>(undefined);

export const UserProvider = ({
  children,
  initialUser,
}: {
  children: ReactNode;
  initialUser: User | null;
}) => {
  const [user, setUser] = useState<User | null>(initialUser);

  const logout = () => {
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, setUser, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextProps => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
