import { Spinner, Container, Row, Col } from 'react-bootstrap';

function LoadingSpinner() {
  return (
    <Container className="mt-5">
      <Row>
        <Col className="text-center">
          <Spinner animation="border" role="status" variant="primary"/>
          <p className="mt-3">Caricamento...</p>
        </Col>
      </Row>
    </Container>
  );
}

export default LoadingSpinner;
