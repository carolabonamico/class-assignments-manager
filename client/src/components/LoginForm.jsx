import { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import API from '../services/api';

const LoginForm = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Il server si aspetta 'username' invece di 'email'
      const loginData = {
        username: credentials.email,
        password: credentials.password
      };
      console.log('Tentativo di login con:', loginData);
      const user = await API.login(loginData);
      console.log('Login riuscito, utente:', user);
      onLogin(user);
    } catch (err) {
      console.error('Login error completo:', err);
      console.error('Status:', err.status);
      console.error('Message:', err.message);
      if (err.status === 401) {
        setError('Email o password non corretti');
      } else if (err.status === 400) {
        setError('Dati di accesso non validi');
      } else {
        setError('Errore durante il login. Riprova più tardi.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="login-page">
      <div className="login-card">
        {/* Logo e Nome Applicazione */}
        <div className="login-header">
          <div className="app-logo">
            <i className="bi bi-journal-check" style={{ fontSize: '3rem', color: 'var(--primary-blue)' }}></i>
          </div>
          <h2 className="app-title">Sistema Gestione Compiti</h2>
        </div>

        {error && <Alert variant="danger" className="mb-3">{error}</Alert>}

        {/* Form di Login */}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Control
              type="email"
              name="email"
              value={credentials.email}
              onChange={handleChange}
              required
              placeholder="Email"
              className="login-input"
            />
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Control
              type="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              required
              placeholder="Password"
              className="login-input"
            />
          </Form.Group>

          <div className="d-grid mb-4">
            <Button 
              type="submit" 
              size="lg"
              disabled={loading}
              className="login-button"
            >
              {loading ? 'Accesso in corso...' : 'Accedi'}
            </Button>
          </div>
        </Form>

        <hr className="divider" />

        {/* Credenziali Demo */}
        <div className="demo-section">
          <div className="demo-item">
            <strong>Studente:</strong> giulia.bianchi@studenti.polito.it
          </div>
          <div className="demo-item">
            <strong>Password:</strong> student123
          </div>
          <div className="demo-item">
            <strong>Docente:</strong> mario.rossi@polito.it
          </div>
          <div className="demo-item">
            <strong>Password:</strong> password123
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
