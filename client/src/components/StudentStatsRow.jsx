import { Badge, Row, Col } from 'react-bootstrap';

function StudentStatsRow({ student }) {
  const getWeightedAverageDisplay = (average) => {
    if (average === null || average === undefined) {
      return 'N/A';
    }
    return `${average.toFixed(1)}/30`;
  };

  const getAverageBadgeVariant = (average) => {
    if (average === null || average === undefined) return 'secondary';
    if (average >= 24) return 'success';
    if (average >= 18) return 'warning';
    return 'danger';
  };

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
        <Badge bg={getAverageBadgeVariant(student.weighted_average)}>
          {getWeightedAverageDisplay(student.weighted_average)}
        </Badge>
      </Col>
    </Row>
  );
}

export default StudentStatsRow;
