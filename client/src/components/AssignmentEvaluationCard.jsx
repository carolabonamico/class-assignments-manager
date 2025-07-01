import { Card, Form, Button, Badge } from 'react-bootstrap';

function AssignmentEvaluationCard({ 
  assignment, 
  score, 
  setScore, 
  canEvaluate, 
  submitting, 
  onEvaluate 
}) {
  return (
    <Card className="mb-4">
      <Card.Header>
        <h5 className="mb-0">Valutazione</h5>
      </Card.Header>
      <Card.Body>
        {assignment.score !== null && assignment.score !== undefined ? (
          <div>
            <div className="mb-3 d-flex align-items-center">
              <Badge bg="secondary" className="fs-6">
                {assignment.score}/30
              </Badge>
            </div>
          </div>
        ) : canEvaluate ? (
          <Form onSubmit={onEvaluate}>
            <Form.Group className="mb-3">
              <Form.Label>Assegna un punteggio (0-30):</Form.Label>
              <Form.Control
                type="number"
                min="0"
                max="30"
                value={score}
                onChange={(e) => setScore(e.target.value)}
                placeholder="Es: 25"
                required
              />
            </Form.Group>
            <Button 
              type="submit" 
              variant="success" 
              disabled={submitting}
            >
              {submitting ? 'Salvataggio...' : 'Salva Valutazione'}
            </Button>
          </Form>
        ) : (
          <p className="text-muted">
            {!assignment.answer 
              ? 'Nessuna risposta da valutare ancora.' 
              : 'Compito già valutato o chiuso.'
            }
          </p>
        )}
      </Card.Body>
    </Card>
  );
}

export default AssignmentEvaluationCard;
