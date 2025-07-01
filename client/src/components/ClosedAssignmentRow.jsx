import { Row, Col } from "react-bootstrap";

function ClosedAssignmentRow({ assignment }) {
  return (
        
    <Row key={assignment.id}>
        <Col md={8}>
            <div>
                {assignment.question}
            </div>
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