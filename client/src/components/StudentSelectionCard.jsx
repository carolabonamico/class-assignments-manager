import { Card, Form, Button } from 'react-bootstrap';

function StudentSelectionCard({ 
  students, 
  selectedStudents, 
  onStudentToggle, 
  submitting,
  constraintError,
  checkingConstraints
}) {
  return (
    <Card className="desktop-card mb-4">
      <Card.Header>
        <h5 className="mb-0">
          Seleziona Studenti ({selectedStudents.length}/6)
        </h5>
      </Card.Header>
      <Card.Body>
        <div style={{ maxHeight: '260px', overflowY: 'auto' }}>
          {students.map(student => (
            <Form.Check
              key={student.id}
              type="checkbox"
              id={`student-${student.id}`}
              label={student.name}
              checked={selectedStudents.includes(student.id)}
              onChange={() => onStudentToggle(student.id)}
              disabled={!selectedStudents.includes(student.id) && selectedStudents.length >= 6}
              className="mb-2"
            />
          ))}
        </div>

        {selectedStudents.length < 2 && (
          <div className="alert alert-warning mt-3 py-2">
            <small>Seleziona almeno 2 studenti</small>
          </div>
        )}

        {selectedStudents.length >= 6 && (
          <div className="alert alert-info mt-3 py-2">
            <small>Numero massimo di studenti raggiunto (6)</small>
          </div>
        )}

        {checkingConstraints && selectedStudents.length >= 2 && (
          <div className="alert alert-info mt-3 py-2">
            <small>Controllo vincoli in corso...</small>
          </div>
        )}

        {constraintError && (
          <div className="alert alert-danger mt-3 py-2">
            <small>{constraintError}</small>
          </div>
        )}

        <div className="d-grid">
          <Button 
            type="submit" 
            variant="success" 
            disabled={
              submitting || 
              selectedStudents.length < 2 || 
              checkingConstraints || 
              !!constraintError
            }
          >
            {submitting ? 'Creazione in corso...' : 'Crea Compito'}
          </Button>
        </div>
        
      </Card.Body>
      
    </Card>
  );
}

export default StudentSelectionCard;
