import { Container } from 'react-bootstrap';
import { Outlet } from 'react-router-dom';
import Navigation from './Navigation';
import useAuth from '../hooks/useAuth';

function AuthenticatedLayout() {
  const { logout } = useAuth();

  return (
    <div className="App">
      <Navigation onLogout={logout} />
      
      <Container fluid className="px-0">
        <div className="main-content">
          <Outlet />
        </div>
      </Container>
    </div>
  );
}

export default AuthenticatedLayout;
