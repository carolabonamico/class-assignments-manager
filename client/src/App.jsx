import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import Navigation from './components/Navigation';
import LoginForm from './components/LoginForm';
import AssignmentList from './pages/AssignmentList';
import AssignmentDetail from './pages/AssignmentDetail';
import CreateAssignment from './pages/CreateAssignment';
import Statistics from './pages/Statistics';
import LoadingSpinner from './components/LoadingSpinner';
import API from './API/api';
import { AuthProvider } from './contexts/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(true);

  // Check authentication on startup (silently)
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await API.getCurrentUser();
        setLoggedIn(true);
        setUser(userData);
      } catch {
        // Silently ignore errors - user is not authenticated
        setLoggedIn(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  /* Handle user login
   * This function is called when the user submits the login form
   */
  const handleLogin = async (credentials) => {
    try {
      const userData = await API.login(credentials);
      setLoggedIn(true);
      setUser(userData);
      setLoginError(''); // Reset error message after successful login
    } catch (err) {
      const errorMessage = err.error || err.message || err.toString() || 'Errore durante il login';
      setLoginError(errorMessage);
    }
  };

  /* Handle user logout
   * This function is called when the user clicks the logout button
   * It clears the user session and updates the state
   */
  const handleLogout = async () => {
    await API.logout();
    setLoggedIn(false);
    setUser(null);
    setLoginError('');
  };

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <AuthProvider user={user} logout={handleLogout}>
      <div className="App">
        {loggedIn && <Navigation onLogout={handleLogout} />}

        {loginError && (
          <div className={`alert alert-danger m-3`} role="alert">
            {loginError}
          </div>
        )}

        {/* If user is logged in, show the main content with routes */}
        {loggedIn ? (
          <Container fluid className="px-0">
            <div className="main-content">
              <Routes>
                <Route 
                  path="/" 
                  element={<Navigate to="/assignments" replace />} 
                />
                <Route 
                  path="/assignments" 
                  element={<AssignmentList />} 
                />
                <Route 
                  path="/assignments/:id" 
                  element={<AssignmentDetail />} 
                />
                <Route 
                  path="/assignments/new" 
                  element={
                    user?.role === 'teacher' ? (
                      <CreateAssignment />
                    ) : (
                      <Navigate to="/assignments" replace />
                    )
                  } 
                />
                <Route 
                  path="/statistics" 
                  element={
                    user?.role === 'teacher' ? (
                      <Statistics />
                    ) : (
                      <Navigate to="/assignments" replace />
                    )
                  } 
                />
                <Route path="*" element={<Navigate to="/assignments" replace />} />
              </Routes>
            </div>
          </Container>
        ) : (
          <Routes>
            <Route 
              path="/login" 
              element={<LoginForm onLogin={handleLogin} />} 
            />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        )}
      </div>
    </AuthProvider>
  );
}

export default App;
