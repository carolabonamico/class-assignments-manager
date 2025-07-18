import { Row, Col } from "react-bootstrap";

function ClosedAssignmentRow({ assignment }) {
  return (
    <Row className="border-bottom py-3 align-items-center">
      <Col md={8}>
        {assignment.question}
      </Col>
      <Col className="text-center" md={4}>
          <span className={`${assignment.score >= 18 ? 'text-success' : 'text-danger'}`}>
          {assignment.score}/30
          </span>
      </Col>
    </Row>
  );
}

export default ClosedAssignmentRow;