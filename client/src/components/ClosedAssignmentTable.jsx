import { Card } from "react-bootstrap";
import { Row, Col } from "react-bootstrap";
import ClosedAssignmentRow from "../components/ClosedAssignmentRow";

function ClosedAssignmentTable({ assignments }) {
  return (
      
      <Card className="desktop-card">
        <Card.Header>
          <h5 className="mb-0">Compiti Completati</h5>
        </Card.Header>
        <Card.Body>
          {assignments.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted">Non hai ancora completato nessun compito.</p>
            </div>
          ) : (
            <div>
              {/* Header Row */}
              <Row className="fw-bold border-bottom pb-2 mb-3">
                <Col md={8} className="ps-3">Domanda</Col>
                <Col md={4} className="text-center">Punteggio</Col>
              </Row>
              
              {/* Assignment Rows */}
              {assignments.map(assignment => (
                <ClosedAssignmentRow key={assignment.id} assignment={assignment} />
              ))}
            </div>
          )}
        </Card.Body>
      </Card>
    );
}

export default ClosedAssignmentTable;