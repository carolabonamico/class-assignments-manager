import { useState, useEffect } from 'react';
import { Card, Form, Button, Alert, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import API from '../API/api';
import LoadingSpinner from '../components/LoadingSpinner';
import useAuth from '../hooks/useAuth';

function OpenAssignments() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState({});
  const [answers, setAnswers] = useState({});
  const [evaluations, setEvaluations] = useState({});

  useEffect(() => {
    const fetchOpenAssignments = async () => {
      try {
        const data = await API.getOpenAssignments();
        setAssignments(data);
        
        // Initialize answers state for existing answers
        const initialAnswers = {};
        data.forEach(assignment => {
          if (assignment.answer) {
            initialAnswers[assignment.id] = assignment.answer;
          }
        });
        setAnswers(initialAnswers);
      } catch {
        setError('Errore nel caricamento dei compiti aperti');
      } finally {
        setLoading(false);
      }
    };

    fetchOpenAssignments();
  }, []);

  const handleAnswerChange = (assignmentId, value) => {
    setAnswers(prev => ({
      ...prev,
      [assignmentId]: value
    }));
  };

  const handleSubmitAnswer = async (assignmentId) => {
    if (!answers[assignmentId]?.trim()) {
      setError('La risposta non può essere vuota');
      return;
    }

    setSubmitting(prev => ({ ...prev, [assignmentId]: true }));
    setError('');

    try {
      await API.updateAssignmentAnswer(assignmentId, answers[assignmentId]);
      
      // Update the assignment in state
      setAssignments(prev => prev.map(assignment => 
        assignment.id === assignmentId 
          ? { ...assignment, answer: answers[assignmentId] }
          : assignment
      ));
      
      // Show success message briefly
      setError('');
      setTimeout(() => {
        // Optionally show a success message
      }, 100);
    } catch (err) {
      setError(err.error || err.message || 'Errore nel salvare la risposta');
    } finally {
      setSubmitting(prev => ({ ...prev, [assignmentId]: false }));
    }
  };

  const handleEvaluationChange = (assignmentId, value) => {
    setEvaluations(prev => ({
      ...prev,
      [assignmentId]: value
    }));
  };

  const handleSubmitEvaluation = async (assignmentId) => {
    const score = parseInt(evaluations[assignmentId]);
    if (isNaN(score) || score < 0 || score > 30) {
      setError('Il punteggio deve essere un numero tra 0 e 30');
      return;
    }

    setSubmitting(prev => ({ ...prev, [assignmentId]: true }));
    setError('');

    try {
      await API.evaluateAssignment(assignmentId, score);
      
      // Remove the assignment from the list since it's now closed
      setAssignments(prev => prev.filter(assignment => assignment.id !== assignmentId));
      
      // Clear the evaluation input
      setEvaluations(prev => {
        const newEvaluations = { ...prev };
        delete newEvaluations[assignmentId];
        return newEvaluations;
      });
    } catch (err) {
      setError(err.error || err.message || 'Errore nella valutazione');
    } finally {
      setSubmitting(prev => ({ ...prev, [assignmentId]: false }));
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="desktop-layout">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="text-primary-blue">
          {user.role === 'teacher' ? 'Compiti Aperti da Valutare' : 'Compiti Aperti'}
        </h1>
      </div>

      {error && (
        <Alert variant="danger" onClose={() => setError('')} dismissible>
          {error}
        </Alert>
      )}

      {assignments.length === 0 ? (
        <Card className="desktop-card">
          <Card.Body className="text-center">
            <p className="text-muted">
              {user.role === 'teacher' 
                ? 'Non ci sono compiti aperti da valutare.' 
                : 'Non hai compiti aperti al momento.'}
            </p>
            {user.role === 'teacher' && (
              <Button 
                variant="primary" 
                onClick={() => navigate('/assignments/new')}
              >
                Crea Nuovo Compito
              </Button>
            )}
          </Card.Body>
        </Card>
      ) : (
        <div className="assignment-list-desktop">
          {assignments.map(assignment => (
            <Card key={assignment.id} className="desktop-card mb-4">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <div>
                  <h5 className="mb-0">Compito #{assignment.id}</h5>
                  {user.role === 'student' && (
                    <small className="text-muted">
                      Docente: {assignment.teacherName}
                    </small>
                  )}
                </div>
                <Badge bg="success">Aperto</Badge>
              </Card.Header>
              
              <Card.Body>
                <div className="mb-4">
                  <h6 className="fw-bold">Domanda:</h6>
                  <p className="mb-0">{assignment.question}</p>
                </div>

                {user.role === 'student' && (
                  <div>
                    <h6 className="fw-bold">La tua risposta:</h6>
                    <Form.Group className="mb-3">
                      <Form.Control
                        as="textarea"
                        rows={4}
                        value={answers[assignment.id] || ''}
                        onChange={(e) => handleAnswerChange(assignment.id, e.target.value)}
                        placeholder="Scrivi qui la tua risposta..."
                        disabled={submitting[assignment.id]}
                      />
                    </Form.Group>
                    <Button
                      variant="primary"
                      onClick={() => handleSubmitAnswer(assignment.id)}
                      disabled={submitting[assignment.id] || !answers[assignment.id]?.trim()}
                    >
                      {submitting[assignment.id] ? 'Salvando...' : 'Salva Risposta'}
                    </Button>
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
                        <Form.Group className="mb-3">
                          <div className="d-flex align-items-center gap-2">
                            <Form.Control
                              type="number"
                              min="0"
                              max="30"
                              style={{ width: '100px' }}
                              value={evaluations[assignment.id] || ''}
                              onChange={(e) => handleEvaluationChange(assignment.id, e.target.value)}
                              placeholder="0-30"
                              disabled={submitting[assignment.id]}
                            />
                            <span>/30</span>
                            <Button
                              variant="success"
                              onClick={() => handleSubmitEvaluation(assignment.id)}
                              disabled={submitting[assignment.id] || !evaluations[assignment.id]}
                            >
                              {submitting[assignment.id] ? 'Valutando...' : 'Valuta'}
                            </Button>
                          </div>
                        </Form.Group>
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
          ))}
        </div>
      )}
    </div>
  );
}

export default OpenAssignments;
