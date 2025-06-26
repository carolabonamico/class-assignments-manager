import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Form, Alert, Badge } from 'react-bootstrap';
import API from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import dayjs from 'dayjs';

function AssignmentDetail({ user }) {
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

  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    if (!answer.trim()) {
      setError('La risposta non può essere vuota');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await API.submitAnswer(id, answer);
      setSuccess('Risposta inviata con successo!');
      // Refresh assignment data
      const updatedAssignment = await API.getAssignment(id);
      setAssignment(updatedAssignment);
    } catch (err) {
      setError(err.error || 'Errore nell\'invio della risposta');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEvaluate = async (e) => {
    e.preventDefault();
    const scoreNum = parseInt(score);
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
    } catch (err) {
      setError(err.error || 'Errore nella valutazione');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  if (error && !assignment) {
    return (
      <div>
        <Alert variant="danger">{error}</Alert>
        <Button onClick={() => navigate('/assignments')}>
          Torna alla lista compiti
        </Button>
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

      <div className="desktop-grid">
        <div>
          <Card className="mb-4">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Domanda</h5>
              <Badge bg={assignment.status === 'open' ? 'success' : 'primary'}>
                {assignment.status === 'open' ? 'Aperto' : 'Chiuso'}
              </Badge>
            </Card.Header>
            <Card.Body>
              <p>{assignment.question}</p>
              <hr />
              <small className="text-muted">
                <strong>Docente:</strong> {assignment.teacher_name}<br />
                <strong>Data creazione:</strong> {dayjs(assignment.created_date).format('DD/MM/YYYY HH:mm')}<br />
                <strong>Studenti nel gruppo:</strong> {assignment.students?.length || assignment.groupMembers?.length || 0}
              </small>
            </Card.Body>
          </Card>

          {/* Answer Section */}
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

              {assignment.answer && (
                <div className="mb-3">
                  <div className="border rounded p-3 bg-light">
                    <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>
                      {assignment.answer}
                    </pre>
                  </div>
                </div>
              )}

              {canSubmitAnswer && (
                <Form onSubmit={handleSubmitAnswer}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      {assignment.answer ? 'Modifica risposta:' : 'Scrivi la tua risposta:'}
                    </Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={10}
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      placeholder="Scrivi qui la tua risposta..."
                      required
                    />
                  </Form.Group>
                  <Button type="submit" variant="success" disabled={submitting}>
                    {submitting ? 'Invio in corso...' : 'Invia Risposta'}
                  </Button>
                </Form>
              )}
            </Card.Body>
          </Card>
        </div>

        <div>
          {/* Group Members */}
          {(assignment.students?.length > 0 || assignment.groupMembers?.length > 0) && (
            <Card className="mb-4">
              <Card.Header>
                <h6 className="mb-0">Membri del Gruppo</h6>
              </Card.Header>
              <Card.Body>
                {(assignment.students || assignment.groupMembers || []).map(student => (
                  <div key={student.id} className="mb-1">
                    <small>{student.name}</small>
                  </div>
                ))}
              </Card.Body>
            </Card>
          )}

          {/* Evaluation Section */}
          <Card>
            <Card.Header>
              <h6 className="mb-0">Valutazione</h6>
            </Card.Header>
            <Card.Body>
              {assignment.score !== null && assignment.score !== undefined ? (
                <div>
                  <h4 className="text-center">
                    <Badge 
                      className="fs-5"
                      bg={assignment.score >= 24 ? 'success' : 
                          assignment.score >= 18 ? 'warning' : 'danger'}
                      text={'white'}
                    >
                      {assignment.score}/30
                    </Badge>
                  </h4>
                  {assignment.evaluation_date && (
                    <small className="text-muted">
                      Valutato il: {dayjs(assignment.evaluation_date).format('DD/MM/YYYY HH:mm')}
                    </small>
                  )}
                </div>
              ) : canEvaluate ? (
                <Form onSubmit={handleEvaluate}>
                  <Form.Group className="mb-3">
                    <Form.Label>Assegna punteggio (0-30):</Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      max="30"
                      value={score}
                      onChange={(e) => setScore(e.target.value)}
                      required
                    />
                  </Form.Group>
                  <Button type="submit" variant="success" disabled={submitting} className="w-100">
                    {submitting ? 'Salvataggio...' : 'Salva Valutazione'}
                  </Button>
                </Form>
              ) : (
                <p className="text-muted">
                  {!assignment.answer ? 'In attesa della risposta degli studenti' : 'Non ancora valutato'}
                </p>
              )}
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default AssignmentDetail;
