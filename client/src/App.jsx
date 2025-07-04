import "bootstrap/dist/css/bootstrap.min.css";
import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import AuthenticatedLayout from "./components/AuthenticatedLayout";
import LoginForm from "./components/LoginForm";
import NotFound from "./components/NotFound";
import OpenAssignments from "./pages/OpenAssignments";
import MyScores from "./pages/MyScores";
import CreateAssignment from "./pages/CreateAssignment";
import Statistics from "./pages/Statistics";
import LoadingSpinner from "./components/LoadingSpinner";
import ProtectedRoute from "./components/ProtectedRoute";
import API from "./API/api";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import "./App.css";

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

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
      setMessage({ msg: `Benvenuto, ${userData.name}!`, type: 'success' });
    } catch (err) {
      setMessage({ msg: err, type: 'danger' });
      throw err; // Re-throw per LoginForm
    }
  };

  const handleLogout = async () => {
    await API.logout();
    setLoggedIn(false);
    setUser(null);
    setMessage('');
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
      <Routes>
        <Route element={<AuthenticatedLayout message={message} setMessage={setMessage} onLogout={handleLogout} />}>
          <Route path="/" element={loggedIn ? <Navigate to="/assignments" replace /> : <Navigate to="/login" replace />} />
          <Route path="/assignments" element={loggedIn ? <OpenAssignments /> : <Navigate to="/login" replace />} />
          <Route 
            path="/assignments/new" 
            element={
              loggedIn ? (
                <ProtectedRoute requiredRole="teacher" userRole={user?.role}>
                  <CreateAssignment />
                </ProtectedRoute>
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          <Route 
            path="/my/scores" 
            element={
              loggedIn ? (
                <ProtectedRoute requiredRole="student" userRole={user?.role}>
                  <MyScores />
                </ProtectedRoute>
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          <Route 
            path="/statistics" 
            element={
              loggedIn ? (
                <ProtectedRoute requiredRole="teacher" userRole={user?.role}>
                  <Statistics />
                </ProtectedRoute>
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
        </Route>
        <Route path="/login" element={loggedIn ? <Navigate replace to="/assignments" /> : <LoginForm handleLogin={handleLogin} />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
