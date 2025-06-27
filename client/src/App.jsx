import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Container } from 'react-bootstrap';
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
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState('');
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

  const handleLogin = async (credentials) => {
    try {
      const userData = await API.login(credentials);
      setLoggedIn(true);
      setUser(userData);
    } catch (err) {
      const errorMessage = err.error || err.message || err.toString() || 'Errore durante il login';
      setMessage({ msg: errorMessage, type: 'danger' });
    }
  };

  const handleLogout = async () => {
    await API.logout();
    setLoggedIn(false);
    setUser(null);
    setMessage('');
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
    <div className="App">
      {loggedIn && <Navigation user={user} onLogout={handleLogout} />}
      
      {/* Show message alerts */}
      {message && (
        <div className={`alert alert-${message.type} m-3`} role="alert">
          {message.msg}
        </div>
      )}

      {loggedIn ? (
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
                  user?.role === 'teacher' ? (
                    <CreateAssignment user={user} />
                  ) : (
                    <Navigate to="/" replace />
                  )
                } 
              />
              <Route 
                path="/statistics" 
                element={
                  user?.role === 'teacher' ? (
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
  );
}

export default App;
