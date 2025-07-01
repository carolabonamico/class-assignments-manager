import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Alert } from 'react-bootstrap';
import API from '../API/api';
import LoadingSpinner from '../components/LoadingSpinner';
import AssignmentQuestionCard from '../components/AssignmentQuestionCard';
import AssignmentAnswerCard from '../components/AssignmentAnswerCard';
import AssignmentEvaluationCard from '../components/AssignmentEvaluationCard';
import useAuth from '../hooks/useAuth';

function AssignmentDetail() {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [answer, setAnswer] = useState('');
  const [score, setScore] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        const data = await API.getAssignment(id);
        if (data.error) {
          setError(data.error);
        } else {
          setAssignment(data);
          if (data.answer) {
            setAnswer(data.answer);
          }
          if (data.score) {
            setScore(data.score.toString());
          }
        }
      } catch {
        setError('Errore nel caricamento del compito');
      } finally {
        setLoading(false);
      }
    };

    fetchAssignment();
  }, [id]);

  /* Handle answer submission - adapted for new components */
  const handleSubmitAnswer = async (answerText) => {
    if (!answerText || answerText.trim().length === 0) {
      setError('La risposta non può essere vuota');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await API.submitAnswer(id, answerText);
      setSuccess('Risposta inviata con successo!');
      // Refresh assignment data
      const updatedAssignment = await API.getAssignment(id);
      setAssignment(updatedAssignment);
      setAnswer(updatedAssignment.answer || '');
    } catch {
      setError('Errore nell\'invio della risposta');
    } finally {
      setSubmitting(false);
    }
  };

  /* Handle assignment evaluation - adapted for new components */
  const handleEvaluate = async (scoreValue) => {
    const scoreNum = parseInt(scoreValue);
    if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > 30) {
      setError('Il punteggio deve essere un numero tra 0 e 30');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await API.evaluateAssignment(id, scoreNum);
      setSuccess('Valutazione salvata con successo!');
      // Refresh assignment data
      const updatedAssignment = await API.getAssignment(id);
      setAssignment(updatedAssignment);
      setScore(updatedAssignment.score?.toString() || '');
    } catch {
      setError('Errore nella valutazione');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  // If there's an error and no assignment data, show an error message
  // This can happen if the assignment ID is invalid or the assignment doesn't exist
  if (error && !assignment) {
    return (
      <div>
        <Alert variant="danger">{error}</Alert>
      </div>
    );
  }

  const isTeacher = user.role === 'teacher';
  const isStudent = user.role === 'student';
  const canSubmitAnswer = isStudent && assignment.status === 'open';
  const canEvaluate = isTeacher && assignment.answer && assignment.status === 'open';

  return (
    <div className="desktop-layout">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="text-primary-blue">Dettagli Compito</h1>
        <Button variant="secondary" onClick={() => navigate('/assignments')}>
          Torna alla Lista
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      {/* Card Domanda - usando il nuovo componente */}
      <AssignmentQuestionCard 
        assignment={assignment} 
        isStudent={isStudent} 
      />

      {/* Form risposta studente - usando il nuovo componente */}
      <AssignmentAnswerCard
        assignment={assignment}
        answer={answer}
        setAnswer={setAnswer}
        canSubmitAnswer={canSubmitAnswer}
        submitting={submitting}
        onSubmitAnswer={handleSubmitAnswer}
      />

      {/* Card Membri del Gruppo */}
      {assignment.groupMembers?.length > 0 && (
        <Card className="mb-4">
          <Card.Header>
            <h6 className="mb-0">Membri del Gruppo</h6>
          </Card.Header>
          <Card.Body>
            {assignment.groupMembers.map(student => (
              <div key={student.id} className="mb-1">
                <small>{student.name}</small>
              </div>
            ))}
          </Card.Body>
        </Card>
      )}

      {/* Form valutazione docente */}
      <AssignmentEvaluationCard
        assignment={assignment}
        score={score}
        setScore={setScore}
        canEvaluate={canEvaluate}
        submitting={submitting}
        onEvaluate={handleEvaluate}
      />
    </div>
  );
}

export default AssignmentDetail;
