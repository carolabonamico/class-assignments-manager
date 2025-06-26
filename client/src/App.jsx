import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
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

function AppContent() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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

  const handleLogin = async (user) => {
    try {
      setUser(user);
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
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      setUser(null);
      navigate('/login');
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <AuthProvider user={user} logout={handleLogout}>
      <div className="App">
        {user && <Navigation user={user} onLogout={handleLogout} />}
        {user ? (
          <Container fluid className="px-0">
            <div className="main-content">
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

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
