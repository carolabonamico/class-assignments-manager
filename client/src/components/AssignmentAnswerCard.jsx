import { Card, Form, Button } from 'react-bootstrap';
import dayjs from 'dayjs';

function AssignmentAnswerCard({ 
  assignment, 
  answer, 
  setAnswer, 
  canSubmitAnswer, 
  submitting, 
  onSubmitAnswer 
}) {
  return (
    <Card className="mb-4">
      <Card.Header>
        <h5 className="mb-0">Risposta</h5>
      </Card.Header>
      <Card.Body>
        {!assignment.answer && !canSubmitAnswer && (
          <p className="text-muted">Nessuna risposta fornita ancora.</p>
        )}

        {assignment.answer_date && (
          <div className="mb-3">
            <small className="text-muted">
              Inviata il: {dayjs(assignment.answer_date).format('DD/MM/YYYY HH:mm')}
            </small>
          </div>
        )}

        {/* Display the answer if it exists */}
        {assignment.answer && (
          <div className="mb-3">
            <div className="border rounded p-3 bg-light">
              <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>
                {assignment.answer}
              </pre>
            </div>
          </div>
        )}

        {/* If the student can submit an answer, show the form */}
        {canSubmitAnswer && (
          <Form onSubmit={onSubmitAnswer}>
            <Form.Group className="mb-3">
              <Form.Label>
                {assignment.answer ? 'Modifica risposta:' : 'Scrivi la tua risposta:'}
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={8}
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Scrivi qui la tua risposta..."
                required
              />
            </Form.Group>
            <Button 
              type="submit" 
              variant="primary" 
              disabled={submitting}
            >
              {submitting ? 'Invio in corso...' : (assignment.answer ? 'Aggiorna Risposta' : 'Invia Risposta')}
            </Button>
          </Form>
        )}
      </Card.Body>
    </Card>
  );
}

export default AssignmentAnswerCard;
