import { Badge, Row, Col } from 'react-bootstrap';

function StudentStatsRow({ student }) {
  const getWeightedAverageDisplay = (average) => {
    if (average === null || average === undefined) {
      return 'N/A';
    }
    return `${average.toFixed(1)}/30`;
  };

  const weightedAverage = student.weighted_average;
  const weightedAverageDisplay = getWeightedAverageDisplay(weightedAverage);
  const isNumber = typeof weightedAverage === 'number' && !isNaN(weightedAverage);

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
        <span
          className={
            !isNumber
              ? ''
              : weightedAverage >= 18
              ? 'text-success'
              : 'text-danger'
          }
        >
          {weightedAverageDisplay}
        </span>
      </Col>
    </Row>
  );
}

export default StudentStatsRow;
