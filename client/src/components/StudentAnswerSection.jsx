import { useState, useActionState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import API from '../API/api';
import 'bootstrap-icons/font/bootstrap-icons.css';

function StudentAnswerSection({ assignment, onUpdateAssignment }) {
  const [answer, setAnswer] = useState(assignment.answer || '');
  const [isEditing, setIsEditing] = useState(false);
  const [showAlerts, setShowAlerts] = useState({ error: true, success: true });

  // Handle answer submission
  const [answerState, answerFormAction, isAnswerPending] = useActionState(submitAnswerAction, {});

  async function submitAnswerAction(prevState, formData) {
    setShowAlerts({ error: true, success: true }); // Reset alert visibility
    
    const answerText = formData.get('answer');
    
    if (!answerText || !answerText.trim()) {
      return { error: 'La risposta non può essere vuota' };
    }

    try {
      await API.updateAssignmentAnswer(assignment.id, answerText);
      
      // Update the assignment with the new answer
      onUpdateAssignment(assignment.id, { ...assignment, answer: answerText });
      
      // Exit editing mode after successful submission
      setIsEditing(false);
      
      return { success: 'Risposta salvata con successo!' };
    } catch (err) {
      return { error: err.error || err.message || 'Errore nel salvare la risposta' };
    }
  }

  const handleAnswerChange = (value) => {
    setAnswer(value);
  };

  return (
    <>
      <h6 className="fw-bold">Assegnato da:</h6>
      <p>{assignment.teacher_name}</p>
      
      {/* Show loading/error states */}
      {isAnswerPending && <Alert variant="warning">Salvando risposta...</Alert>}

      {answerState.error && showAlerts.error && 
        <Alert variant="danger" dismissible onClose={() => setShowAlerts(prev => ({ ...prev, error: false }))}>
          {answerState.error}
        </Alert>
      }

      {answerState.success && showAlerts.success && 
        <Alert variant="success" dismissible onClose={() => setShowAlerts(prev => ({ ...prev, success: false }))}>
          {answerState.success}
        </Alert>
      }
      
      {/* If no answer exists, show "Add Answer" button */}
      {!assignment.answer && !isEditing && (
        <Button
          variant="primary"
          onClick={() => setIsEditing(true)}
          className="mb-3"
        >
          <i className="bi bi-plus-circle me-2"></i>
          Aggiungi
        </Button>
      )}
      
      {/* If answer exists and not editing, show answer with edit button */}
      {assignment.answer && !isEditing && (
        <>
          <h6 className="fw-bold">La tua risposta:</h6>
          <p>{assignment.answer}</p>
          <Button
            variant="primary"
            onClick={() => setIsEditing(true)}
            className="mb-3"
          >
            <i className="bi bi-pencil-square me-2"></i>
            Modifica
          </Button>
        </>
      )}
      
      {/* Show form when editing (either creating new or editing existing) */}
      {isEditing && (
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
          <div className="d-flex gap-2">
            <Button
              type="submit"
              variant="success"
              disabled={isAnswerPending || !answer.trim()}
            >
              {isAnswerPending ? 'Salvando...' : 'Salva'}
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={() => {
                setIsEditing(false);
                setAnswer(assignment.answer || ''); // Reset to original answer
              }}
              disabled={isAnswerPending}
            >
              Annulla
            </Button>
          </div>
        </Form>
      )}
    </>
  );
}

export default StudentAnswerSection;
