import { Badge, Row, Col } from 'react-bootstrap';

function StudentStatsRow({ student }) {
  
  const average = student.weighted_average;
  
  const averageDisplay = student.total_assignments === 0 || average == null 
    ? 'N/A' 
    : `${average.toFixed(1)}/30`;
  const averageClass = student.total_assignments > 0 && average != null 
    ? (average >= 18 ? 'text-success' : 'text-danger') 
    : '';

  return (
    <Row className="border-bottom py-3 align-items-center">
      <Col md={4}>
        <strong>{student.name}</strong>
      </Col>
      <Col md={2} className="text-center">
        {student.open_assignments || 0}
      </Col>
      <Col md={2} className="text-center">
        {student.closed_assignments || 0}
      </Col>
      <Col md={2} className="text-center">
        {student.total_assignments || 0}
      </Col>
      <Col md={2} className="text-center">
        <span className={averageClass}>
          {averageDisplay}
        </span>
      </Col>
    </Row>
  );
}

export default StudentStatsRow;
