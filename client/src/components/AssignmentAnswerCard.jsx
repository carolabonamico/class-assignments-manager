import { Card, Form, Button } from 'react-bootstrap';

function AssignmentAnswerCard({ 
  assignment, 
  answer, 
  setAnswer, 
  canSubmitAnswer, 
  submitting, 
  onSubmitAnswer 
}) {
  // Handle form submission with preventDefault
  const handleFormSubmit = (e) => {
    e.preventDefault();
    onSubmitAnswer(answer);
  };

  return (
    <Card className="mb-4">
      <Card.Header>
        <h5 className="mb-0">Risposta</h5>
      </Card.Header>
      <Card.Body>
        {!assignment.answer && !canSubmitAnswer && (
          <p className="text-muted">Nessuna risposta fornita ancora.</p>
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
          <Form onSubmit={handleFormSubmit}>
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
