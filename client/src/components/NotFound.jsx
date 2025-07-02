import { Container, Row, Col } from 'react-bootstrap';

function NotFound() {
  return (
    <Container fluid className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
      <Row>
        <Col className="text-center">
          <h1 className="text-primary display-1 mb-3">404</h1>
          <h3 className="text-primary mb-4">Pagina non trovata</h3>
          <p className="text-muted">
            La pagina che stai cercando non esiste o è stata spostata.
          </p>
        </Col>
      </Row>
    </Container>
  );
}

export default NotFound;
