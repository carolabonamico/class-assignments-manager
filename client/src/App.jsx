import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import { AuthProvider } from './context/AuthContext';
import Navigation from './components/Navigation';
import LoginForm from './components/LoginForm';
import Dashboard from './pages/Dashboard';
import AssignmentList from './pages/AssignmentList';
import AssignmentDetail from './pages/AssignmentDetail';
import CreateAssignment from './pages/CreateAssignment';
import Statistics from './pages/Statistics';
import LoadingSpinner from './components/LoadingSpinner';
import API from './services/api';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on app start
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await API.getCurrentUser();
        setUser(userData);
      } catch {
        console.log('User not authenticated');
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const handleLogin = async (credentials) => {
    try {
      const userData = await API.login(credentials);
      setUser(userData);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.error || error.message || 'Errore durante il login'
      };
    }
  };

  const handleLogout = async () => {
    try {
      await API.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <AuthProvider user={user} logout={handleLogout}>
      <Router>
        <div className="App">
          {user && <Navigation user={user} onLogout={handleLogout} />}
          {user ? (
            <Container fluid className="mt-4 px-4">
              <Routes>
            <Route 
              path="/" 
              element={<Dashboard user={user} />} 
            />
            <Route 
              path="/assignments" 
              element={<AssignmentList user={user} />} 
            />
            <Route 
              path="/assignments/:id" 
              element={<AssignmentDetail user={user} />} 
            />
            <Route 
              path="/create-assignment" 
              element={
                user.role === 'teacher' ? (
                  <CreateAssignment user={user} />
                ) : (
                  <Navigate to="/" replace />
                )
              } 
            />
            <Route 
              path="/statistics" 
              element={
                user.role === 'teacher' ? (
                  <Statistics user={user} />
                ) : (
                  <Navigate to="/" replace />
                )
              } 
            />
            <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
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
      </Router>
    </AuthProvider>
  );
}

export default App;
