import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Form, Button, Alert } from 'react-bootstrap';
import API from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

function CreateAssignment() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [question, setQuestion] = useState('');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const data = await API.getStudents();
        setStudents(data);
      } catch {
        setError('Errore nel caricamento degli studenti');
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const handleStudentSelection = (studentId) => {
    if (selectedStudents.includes(studentId)) {
      setSelectedStudents(selectedStudents.filter(id => id !== studentId));
    } else {
      if (selectedStudents.length < 6) {
        setSelectedStudents([...selectedStudents, studentId]);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!question.trim()) {
      setError('La domanda è obbligatoria');
      return;
    }

    if (selectedStudents.length < 2) {
      setError('Seleziona almeno 2 studenti');
      return;
    }

    if (selectedStudents.length > 6) {
      setError('Seleziona massimo 6 studenti');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const assignmentData = {
        question: question.trim(),
        studentIds: selectedStudents
      };

      const newAssignment = await API.createAssignment(assignmentData);
      navigate(`/assignments/${newAssignment.id}`);
    } catch (err) {
      if (err.errors) {
        setError(err.errors.map(e => e.msg).join(', '));
      } else {
        setError(err.error || 'Errore nella creazione del compito');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="desktop-layout">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="text-primary-blue">Crea Nuovo Compito</h1>
        <Button variant="secondary" onClick={() => navigate('/assignments')}>
          Annulla
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Form onSubmit={handleSubmit} className="desktop-form">
        <div className="row g-4">
          <div className="col-lg-8">
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
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Es: Implementa un algoritmo di ordinamento merge sort in JavaScript e spiega la complessità temporale..."
                    required
                  />
                  <Form.Text className="text-muted">
                    Fornisci una descrizione dettagliata del compito che gli studenti dovranno svolgere.
                  </Form.Text>
                </Form.Group>
              </Card.Body>
            </Card>
          </div>

          <div className="col-lg-4">
            <Card className="desktop-card mb-4">
              <Card.Header>
                <h5 className="mb-0">
                  Seleziona Studenti ({selectedStudents.length}/6)
                </h5>
              </Card.Header>
              <Card.Body>
                <p className="text-muted small mb-3">
                  Seleziona da 2 a 6 studenti per questo compito. Il sistema impedisce la formazione di gruppi dove coppie di studenti hanno già lavorato insieme in 2 o più compiti precedenti.
                </p>
                
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {students.map(student => (
                    <Form.Check
                      key={student.id}
                      type="checkbox"
                      id={`student-${student.id}`}
                      label={student.name}
                      checked={selectedStudents.includes(student.id)}
                      onChange={() => handleStudentSelection(student.id)}
                      disabled={!selectedStudents.includes(student.id) && selectedStudents.length >= 6}
                      className="mb-2"
                    />
                  ))}
                </div>

                {selectedStudents.length < 2 && (
                  <div className="alert alert-warning mt-3 py-2">
                    <small>Seleziona almeno 2 studenti</small>
                  </div>
                )}

                {selectedStudents.length >= 6 && (
                  <div className="alert alert-info mt-3 py-2">
                    <small>Numero massimo di studenti raggiunto (6)</small>
                  </div>
                )}
              </Card.Body>
            </Card>

            <div className="d-grid">
              <Button 
                type="submit" 
                variant="success" 
                size="lg"
                disabled={submitting || selectedStudents.length < 2}
              >
                {submitting ? 'Creazione in corso...' : 'Crea Compito'}
              </Button>
            </div>
          </div>
        </div>
      </Form>
    </div>
  );
}

export default CreateAssignment;
