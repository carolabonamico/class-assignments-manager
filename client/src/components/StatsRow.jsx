import { Row, Col, Badge } from 'react-bootstrap';

function StatsRow({ student }) {
  
  const average = student.weighted_average;
  
  const averageDisplay = student.total_assignments === 0 || average == null 
    ? 'N/A' 
    : `${average.toFixed(2)}/30`;

  const averageClass = student.total_assignments > 0 && average != null 
    ? (average >= 18 ? 'text-success' : 'text-danger') 
    : '';

  return (
    <Row className="border-bottom py-3 align-items-center">
      <Col md={3}>
        {student.name}
      </Col>
      <Col md={3} className="text-center">
        <Badge bg="success">
          {student.open_assignments || 0}
        </Badge>
      </Col>
      <Col md={3} className="text-center">
        <Badge bg="primary">
          {student.closed_assignments || 0}
        </Badge>
      </Col>
      <Col md={3} className="text-center">
        <span className={averageClass}>{averageDisplay}</span>
      </Col>
    </Row>
  );
}

export default StatsRow;
