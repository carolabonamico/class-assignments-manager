import { useState, useActionState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import API from '../API/api';
import 'bootstrap-icons/font/bootstrap-icons.css';

function TeacherEvaluationSection({ assignment, onRemoveAssignment, onEvaluationAlert }) {
  const [evaluation, setEvaluation] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);

  // Handle evaluation submission
  const [, evalFormAction, isEvalPending] = useActionState(submitEvaluationAction, {});

  async function submitEvaluationAction(prevState, formData) {
    const score = parseInt(formData.get('evaluation'));
    
    if (isNaN(score) || score < 0 || score > 30) {
      onEvaluationAlert({ type: 'error', message: 'Il punteggio deve essere un numero tra 0 e 30' });
      return { error: 'Il punteggio deve essere un numero tra 0 e 30' };
    }

    try {
      await API.evaluateAssignment(assignment.id, score);
      
      // Remove the assignment from the list since it's now closed
      onRemoveAssignment(assignment.id);
      
      // Exit evaluation mode after successful submission
      setIsEvaluating(false);
      
      // Show success message at page level
      onEvaluationAlert({ type: 'success', message: 'Valutazione salvata con successo!' });
      
      return { success: 'Valutazione salvata con successo!' };
    } catch (err) {
      const errorMessage = err.error || err.message || 'Errore nella valutazione';
      onEvaluationAlert({ type: 'error', message: errorMessage });
      return { error: errorMessage };
    }
  }

  const handleEvaluationChange = (value) => {
    setEvaluation(value);
  };

  return (
    <>
      <h6 className="fw-bold">Risposta dello studente:</h6>
      <p>{assignment.answer}</p>
      
      {/* Show loading state only */}
      {isEvalPending && <Alert variant="warning">Salvando valutazione...</Alert>}
      
      {/* If not evaluating, show "Add Evaluation" button */}
      {!isEvaluating && (
        <Button
          variant="primary"
          onClick={() => setIsEvaluating(true)}
          className="mb-3"
        >
          <i className="bi bi-plus-circle me-2"></i>
          Valuta
        </Button>
      )}
      
      {/* Show form when evaluating */}
      {isEvaluating && (
        <>
          <h6 className="fw-bold">Valutazione:</h6>
          <Form action={evalFormAction}>
            <Form.Group className="mb-3">
              <div className="d-flex align-items-center mb-2">
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
                <span className="ms-2">/30</span>
              </div>
              <div className="d-flex gap-2">
                <Button
                  type="submit"
                  variant="success"
                  disabled={isEvalPending || !evaluation}
                >
                  {isEvalPending ? 'Salvando...' : 'Salva'}
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  onClick={() => {
                    setIsEvaluating(false);
                    setEvaluation(''); // Reset evaluation
                  }}
                  disabled={isEvalPending}
                >
                  Annulla
                </Button>
              </div>
            </Form.Group>
          </Form>
        </>
      )}
    </>
  );
}

export default TeacherEvaluationSection;
