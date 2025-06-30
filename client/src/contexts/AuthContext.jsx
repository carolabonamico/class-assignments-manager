import { createContext } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children, user, logout }) => {
  const handleApiError = (error) => {
    // If we get a 401 error, automatically logout the user
    if (error.status === 401) {
      console.log('Authentication expired, logging out...');
      logout();
    }
    throw error; // Re-throw the error for component handling
  };

  return (
    <AuthContext.Provider value={{ user, handleApiError }}>
      {children}
    </AuthContext.Provider>
  );
};
