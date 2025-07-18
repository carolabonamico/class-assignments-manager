/* This file only contains the provider for the AuthContext.
 * The context itself is defined in AuthContext.js.
 */
import { AuthContext } from './AuthContext.js';

export const AuthProvider = ({ children, user, logout }) => {
  const handleApiError = (error) => {
    // If we get a 401 error, automatically logout the user
    if (error.status === 401) {
      logout();
    }
    throw error; // Re-throw the error for component handling
  };

  return (
    <AuthContext.Provider value={{ user, logout, handleApiError }}>
      {children}
    </AuthContext.Provider>
  );
};
