import { Card, Form } from 'react-bootstrap';

function NewQuestionFormCard({ question, onQuestionChange }) {
  return (
    <Card className="desktop-card mb-4">
      <Card.Header>
        <h5 className="mb-0">Domanda del Compito</h5>
      </Card.Header>
      <Card.Body>
        <Form.Group>
          <Form.Label>Scrivi la domanda o il compito da assegnare:</Form.Label>
          <Form.Control
            as="textarea"
            rows={8}
            name="question"
            value={question}
            onChange={(e) => onQuestionChange(e.target.value)}
            placeholder="Es: Implementa un algoritmo di ordinamento merge sort in JavaScript e spiega la complessità temporale..."
            required
          />
        </Form.Group>
      </Card.Body>
    </Card>
  );
}

export default NewQuestionFormCard;
