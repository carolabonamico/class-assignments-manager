import { Alert, Container, Row } from 'react-bootstrap';
import { Outlet } from 'react-router-dom';
import Navigation from './Navigation';

function AuthenticatedLayout({ message, setMessage, onLogout }) {
  return (
    <>
      <Navigation onLogout={onLogout} />
      <Container fluid className="mt-3">
        {message && <Row>
          <Alert variant={message.type} onClose={() => setMessage('')} dismissible>
            {message.msg}
          </Alert>
        </Row>}
        <div className="main-content">
          <Outlet />
        </div>
      </Container>
    </>
  );
}

export default AuthenticatedLayout;
