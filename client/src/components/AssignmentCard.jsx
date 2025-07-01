import { useState } from 'react';
import { Card, Form, Button, } from 'react-bootstrap';
import API from '../API/api';
import useAuth from '../hooks/useAuth';

function AssignmentCard({ assignment, onUpdateAssignment, onRemoveAssignment, onError }) {
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [answer, setAnswer] = useState(assignment.answer || '');
  const [evaluation, setEvaluation] = useState('');

  const handleAnswerChange = (value) => {
    setAnswer(value);
  };

  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    
    if (!answer.trim()) {
      onError('La risposta non può essere vuota');
      return;
    }

    setSubmitting(true);
    
    try {
      await API.updateAssignmentAnswer(assignment.id, answer);
      
      // Update the assignment with the new answer
      onUpdateAssignment(assignment.id, { ...assignment, answer });
      
    } catch (err) {
      onError(err.error || err.message || 'Errore nel salvare la risposta');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEvaluationChange = (value) => {
    setEvaluation(value);
  };

  const handleSubmitEvaluation = async (e) => {
    e.preventDefault();
    
    const score = parseInt(evaluation);
    if (isNaN(score) || score < 0 || score > 30) {
      onError('Il punteggio deve essere un numero tra 0 e 30');
      return;
    }

    setSubmitting(true);
    
    try {
      await API.evaluateAssignment(assignment.id, score);
      
      // Remove the assignment from the list since it's now closed
      onRemoveAssignment(assignment.id);
      
    } catch (err) {
      onError(err.error || err.message || 'Errore nella valutazione');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="desktop-card mb-4">
      <Card.Header>
        <h5 className="mb-0">Domanda</h5>
    </Card.Header>
      
      <Card.Body>
        <div className="mb-4">
          <p className="mb-0">{assignment.question}</p>
        </div>

        {user.role === 'student' && (
          <div>
            <h6 className="fw-bold">La tua risposta:</h6>
            <Form onSubmit={handleSubmitAnswer}>
              <Form.Group className="mb-3">
                <Form.Control
                  as="textarea"
                  rows={4}
                  value={answer}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                  placeholder="Scrivi qui la tua risposta..."
                  disabled={submitting}
                />
              </Form.Group>
              <Button
                type="submit"
                variant="success"
                disabled={submitting || !answer.trim()}
              >
                {submitting ? 'Salvando...' : 'Salva Risposta'}
              </Button>
            </Form>
          </div>
        )}

        {user.role === 'teacher' && (
          <div>
            {assignment.answer ? (
              <div>
                <h6 className="fw-bold">Risposta dello studente:</h6>
                <div className="bg-light p-3 rounded mb-3">
                  <p className="mb-0">{assignment.answer}</p>
                </div>
                
                <h6 className="fw-bold">Valutazione:</h6>
                <Form onSubmit={handleSubmitEvaluation}>
                  <Form.Group className="mb-3">
                    <div className="d-flex align-items-center gap-2">
                      <Form.Control
                        type="number"
                        min="0"
                        max="30"
                        style={{ width: '100px' }}
                        value={evaluation}
                        onChange={(e) => handleEvaluationChange(e.target.value)}
                        placeholder="0-30"
                        disabled={submitting}
                      />
                      <span>/30</span>
                      <Button
                        type="submit"
                        variant="success"
                        disabled={submitting || !evaluation}
                      >
                        {submitting ? 'Valutando...' : 'Valuta'}
                      </Button>
                    </div>
                  </Form.Group>
                </Form>
              </div>
            ) : (
              <div className="text-muted">
                <em>Nessuna risposta ancora fornita dagli studenti.</em>
              </div>
            )}
          </div>
        )}
      </Card.Body>
    </Card>
  );
}

export default AssignmentCard;
