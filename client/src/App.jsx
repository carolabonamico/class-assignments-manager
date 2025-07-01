import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import OpenAssignments from './pages/OpenAssignments';
import MyScores from './pages/MyScores';
import CreateAssignment from './pages/CreateAssignment';
import Statistics from './pages/Statistics';
import LoadingSpinner from './components/LoadingSpinner';
import AuthenticatedLayout from './components/AuthenticatedLayout';
import ProtectedRoute from './components/ProtectedRoute';
import API from './API/api';
import { AuthProvider } from './contexts/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(true);

  // Check authentication on startup
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await API.getCurrentUser();
        setLoggedIn(true);
        setUser(userData);
      } catch {
        setLoggedIn(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogin = async (credentials) => {
    try {
      const userData = await API.login(credentials);
      setLoggedIn(true);
      setUser(userData);
      setLoginError('');
    } catch (err) {
      const errorMessage = err.error || err.message || err.toString() || 'Errore durante il login';
      setLoginError(errorMessage);
    }
  };

  const handleLogout = async () => {
    await API.logout();
    setLoggedIn(false);
    setUser(null);
    setLoginError('');
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <AuthProvider user={user} logout={handleLogout}>
      {loginError && (
        <div className={`alert alert-danger m-3`} role="alert">
          {loginError}
        </div>
      )}

      <Routes>
        {/* Public routes */}
        <Route 
          path="/login" 
          element={
            loggedIn ? (
              <Navigate to="/assignments" replace />
            ) : (
              <LoginForm onLogin={handleLogin} />
            )
          } 
        />
        
        {/* Protected routes with shared layout */}
        <Route 
          path="/" 
          element={
            loggedIn ? (
              <AuthenticatedLayout />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        >
          <Route index element={<Navigate to="/assignments" replace />} />
          <Route path="assignments" element={<OpenAssignments />} />
          <Route 
            path="assignments/new" 
            element={
              <ProtectedRoute role="teacher" userRole={user?.role}>
                <CreateAssignment />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="my/scores" 
            element={
              <ProtectedRoute role="student" userRole={user?.role}>
                <MyScores />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="statistics" 
            element={
              <ProtectedRoute role="teacher" userRole={user?.role}>
                <Statistics />
              </ProtectedRoute>
            } 
          />
        </Route>

        {/* Catch all */}
        <Route 
          path="*" 
          element={
            loggedIn ? (
              <Navigate to="/assignments" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
      </Routes>
    </AuthProvider>
  );
}

export default App;
