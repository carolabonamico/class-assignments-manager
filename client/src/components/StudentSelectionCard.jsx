import { Card, Form, Button, Alert } from 'react-bootstrap';

function StudentSelectionCard(props) {
  
  return (
    <Card className="desktop-card mb-4">
      <Card.Header>
        <h5 className="mb-0">
          Seleziona Studenti ({props.selectedStudents.length}/6)
        </h5>
      </Card.Header>
      <Card.Body>
        <div style={{ maxHeight: '260px', overflowY: 'auto' }}>
          {props.students.map(student => (
            <Form.Check
              key={student.id}
              type="checkbox"
              id={`student-${student.id}`}
              label={student.name}
              checked={props.selectedStudents.includes(student.id)}
              onChange={() => props.onStudentToggle(student.id)}
              disabled={
                !props.selectedStudents.includes(student.id) && 
                props.selectedStudents.length >= 6
              }
              className="mb-2"
            />
          ))}
        </div>

        {props.selectedStudents.length < 2 && (
          <Alert variant="warning" className="mt-3 py-2">
            <small>Seleziona almeno 2 studenti</small>
          </Alert>
        )}

        {props.selectedStudents.length >= 6 && (
          <Alert variant="info" className="mt-3 py-2">
            <small>Numero massimo di studenti raggiunto (6)</small>
          </Alert>
        )}

        {props.checkingConstraints && props.selectedStudents.length >= 2 && (
          <Alert variant="info" className="mt-3 py-2">
            <small>Controllo vincoli in corso...</small>
          </Alert>
        )}

        {props.constraintError && (
          <Alert variant="danger" className="mt-3 py-2">
            <small>{props.constraintError}</small>
          </Alert>
        )}

        <div className="d-grid">
          <Button 
            type="submit" 
            variant="success" 
            disabled={
              props.submitting || 
              props.selectedStudents.length < 2 || 
              props.checkingConstraints || 
              !!props.constraintError // It must be boolean for ||
            }
          >
            {props.submitting ? 'Creazione in corso...' : 'Crea Compito'}
          </Button>
        </div>
        
      </Card.Body>
      
    </Card>
  );
}

export default StudentSelectionCard;
