import { Badge, Row, Col } from 'react-bootstrap';

function StudentStatsRow({ student }) {
  return (
    <Row className="py-3 border-bottom align-items-center hover-row">
      <Col md={4} className="mb-2 mb-md-0">
        <strong>{student.name}</strong>
        <br />
        <small className="text-muted">{student.email}</small>
      </Col>
      <Col md={2} className="text-center">
        <Badge bg="success">{student.open_assignments}</Badge>
      </Col>
      <Col md={2} className="text-center">
        <Badge bg="primary">{student.closed_assignments}</Badge>
      </Col>
      <Col md={2} className="text-center">
        <strong>{student.total_assignments}</strong>
      </Col>
      <Col md={2} className="text-center">
        {student.weighted_average !== null ? (
          <Badge bg="secondary">
            {student.weighted_average.toFixed(2)}
          </Badge>
        ) : (
          <span className="text-muted">N/A</span>
        )}
      </Col>
    </Row>
  );
}

export default StudentStatsRow;
