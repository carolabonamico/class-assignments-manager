import { createContext, useContext } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

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
