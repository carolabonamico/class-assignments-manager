import { Navbar, Nav, Button } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

function Navigation({ onLogout }) {
  const location = useLocation();
  const { user } = useAuth();

  return (
    <Navbar bg="primary" variant="dark" expand="lg" fixed="top" className="px-3">
      <Navbar.Brand as={Link} to="/">
        <i className="bi bi-clipboard-check me-2"></i>
        Sistema Compiti
      </Navbar.Brand>
      
      {user && (
        <>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              {user.role === 'teacher' && (
                <>
                  <Nav.Link 
                    as={Link} 
                    to="/assignments" 
                    active={location.pathname === '/assignments'}
                  >
                    Compiti
                  </Nav.Link>
                  <Nav.Link 
                    as={Link} 
                    to="/create-assignment" 
                    active={location.pathname === '/create-assignment'}
                  >
                    Crea Compito
                  </Nav.Link>
                  <Nav.Link 
                    as={Link} 
                    to="/statistics" 
                    active={location.pathname === '/statistics'}
                  >
                    Statistiche
                  </Nav.Link>
                </>
              )}
            </Nav>
            <Nav>
              <Navbar.Text className="me-3">
                Benvenuto, <strong>{user.name}</strong> ({user.role === 'teacher' ? 'Docente' : 'Studente'})
              </Navbar.Text>
              <Button variant="outline-light" onClick={onLogout}>
                Logout
              </Button>
            </Nav>
          </Navbar.Collapse>
        </>
      )}
    </Navbar>
  );
}

export default Navigation;
