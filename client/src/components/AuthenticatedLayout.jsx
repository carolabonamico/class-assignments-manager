import { Alert, Container } from 'react-bootstrap';
import { Outlet } from 'react-router-dom';
import NavHeader from './NavHeader';

function AuthenticatedLayout({ message, setMessage, onLogout }) {
  return (
    <>
      <NavHeader onLogout={onLogout} />
      <Container fluid className="mt-3">
        <div className="desktop-layout">
          {message && (
            <Alert variant={message.type} onClose={() => setMessage('')} dismissible className="d-flex align-items-center">
              <div className="flex-grow-1">{message.msg}</div>
            </Alert>
          )}
          <div className="main-content">
            <Outlet />
          </div>
        </div>
      </Container>
    </>
  );
}

export default AuthenticatedLayout;
