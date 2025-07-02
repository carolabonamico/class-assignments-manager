import { useState, useActionState } from 'react';
import { Card, Form, Button, Alert } from 'react-bootstrap';
import API from '../API/api';
import useAuth from '../hooks/useAuth';

function AssignmentCard({ assignment, onUpdateAssignment, onRemoveAssignment }) {
  const { user } = useAuth();
  const [answer, setAnswer] = useState(assignment.answer || '');
  const [evaluation, setEvaluation] = useState('');

  // Handle answer submission
  const [answerState, answerFormAction, isAnswerPending] = useActionState(submitAnswerAction, {});

  async function submitAnswerAction(prevState, formData) {
    const answerText = formData.get('answer');
    
    if (!answerText || !answerText.trim()) {
      return { error: 'La risposta non può essere vuota' };
    }

    try {
      await API.updateAssignmentAnswer(assignment.id, answerText);
      
      // Update the assignment with the new answer
      onUpdateAssignment(assignment.id, { ...assignment, answer: answerText });
      
      return { success: 'Risposta salvata con successo!' };
    } catch (err) {
      return { error: err.error || err.message || 'Errore nel salvare la risposta' };
    }
  }

  // Handle evaluation submission
  const [evalState, evalFormAction, isEvalPending] = useActionState(submitEvaluationAction, {});

  async function submitEvaluationAction(prevState, formData) {
    const score = parseInt(formData.get('evaluation'));
    
    if (isNaN(score) || score < 0 || score > 30) {
      return { error: 'Il punteggio deve essere un numero tra 0 e 30' };
    }

    try {
      await API.evaluateAssignment(assignment.id, score);
      
      // Remove the assignment from the list since it's now closed
      onRemoveAssignment(assignment.id);
      
      return { success: 'Valutazione salvata con successo!' };
    } catch (err) {
      return { error: err.error || err.message || 'Errore nella valutazione' };
    }
  }

  const handleAnswerChange = (value) => {
    setAnswer(value);
  };

  const handleEvaluationChange = (value) => {
    setEvaluation(value);
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
          <>
            <h6 className="fw-bold">La tua risposta:</h6>
            
            {/* Show loading/error states */}
            {isAnswerPending && <Alert variant="warning">Salvando risposta...</Alert>}
            {answerState.error && 
              <Alert variant="danger" dismissible onClose={() => answerState.error = ''}>
                {answerState.error}
              </Alert>
            }
            {answerState.success && 
              <Alert variant="success" dismissible onClose={() => answerState.success = ''}>
                {answerState.success}
              </Alert>
            }
            
            <Form action={answerFormAction}>
              <Form.Group className="mb-3">
                <Form.Control
                  as="textarea"
                  rows={4}
                  name="answer"
                  value={answer}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                  placeholder="Scrivi qui la tua risposta..."
                  disabled={isAnswerPending}
                />
              </Form.Group>
              <Button
                type="submit"
                variant="success"
                disabled={isAnswerPending || !answer.trim()}
              >
                {isAnswerPending ? 'Salvando...' : 'Salva Risposta'}
              </Button>
            </Form>
          </>
        )}

        {user.role === 'teacher' && (
          assignment.answer ? (
            <>
              <h6 className="fw-bold">Risposta dello studente:</h6>
              <div className="bg-light rounded mb-3">
                <p className="mb-0">{assignment.answer}</p>
              </div>
              
              <h6 className="fw-bold">Valutazione:</h6>
              
              {/* Show loading/error states */}
              {isEvalPending && <Alert variant="warning">Salvando valutazione...</Alert>}
              {evalState.error && <Alert variant="danger">{evalState.error}</Alert>}
              {evalState.success && <Alert variant="success">{evalState.success}</Alert>}
              
              <Form action={evalFormAction}>
                <Form.Group className="mb-3">
                  <div className="d-flex align-items-center gap-2">
                    <Form.Control
                      type="number"
                      name="evaluation"
                      min="0"
                      max="30"
                      style={{ width: '100px' }}
                      value={evaluation}
                      onChange={(e) => handleEvaluationChange(e.target.value)}
                      placeholder="0-30"
                      disabled={isEvalPending}
                    />
                    <span>/30</span>
                    <Button
                      type="submit"
                      variant="success"
                      disabled={isEvalPending || !evaluation}
                    >
                      {isEvalPending ? 'Valutando...' : 'Valuta'}
                    </Button>
                  </div>
                </Form.Group>
              </Form>
            </>
          ) : (
            <div className="text-muted">
              <em>Nessuna risposta ancora fornita dagli studenti.</em>
            </div>
          )
        )}
      </Card.Body>
    </Card>
  );
}

export default AssignmentCard;
