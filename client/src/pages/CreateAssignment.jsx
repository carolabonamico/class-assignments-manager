import { useState, useEffect } from 'react';
import { Card, Form, Button, Alert } from 'react-bootstrap';
import API from '../API/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { isValidString } from '../../../server/utils.mjs';

function CreateAssignment() {
  const [students, setStudents] = useState([]);
  const [question, setQuestion] = useState('');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const data = await API.getStudents();
        setStudents(data);
      } catch {
        setError('Errore nel caricamento degli studenti. Ricarica la pagina per effettuare nuovamente il login.');
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  /* Handle student selection logic
    * Toggles the selection of a student
    * If the student is already selected, it removes them from the selection
    * If not, it adds them to the selection if the limit of 6 students is not reached
    * The selection is limited to a maximum of 6 students
    * If the user tries to select more than 6 students, it does nothing
  */
  const handleStudentSelection = (studentId) => {
    if (selectedStudents.includes(studentId)) {
      setSelectedStudents(selectedStudents.filter(id => id !== studentId));
    } else {
      if (selectedStudents.length < 6) {
        setSelectedStudents(prev => [...prev, studentId]);
      }
    }
  };

  /* Handle form submission
  * Validates the question and selected students, then submits the assignment
  * If successful, resets the form and shows a success message
  * If there's an error, displays it to the user
  * If the assignment is created successfully, allows the user to view it immediately
  */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isValidString(question)) {
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

      await API.createAssignment(assignmentData);
      setSuccess(`Compito creato con successo!`);
      setError('');
      
      // To reset the form after successful creation to allow creating another assignment
      setQuestion('');
      setSelectedStudents([]);

    } catch (err) {
      if (err.status === 401) {
        setError('Sessione scaduta. Ricarica la pagina per effettuare nuovamente il login.');
      } else {
        setError('Errore nella creazione del compito');
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
      </div>

      {/* Show error or success messages */}
      {error && <Alert variant="danger">{error}</Alert>}
      
      {success && (
        <Alert variant="success" className="d-flex align-items-center">
          <div className="flex-grow-1">{success}</div>
        </Alert>
      )}

      {/* Form for creating a new assignment */}
      <Form onSubmit={handleSubmit} className="desktop-form">
        <div className="desktop-grid">
          <div>
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
                </Form.Group>
              </Card.Body>
            </Card>
          </div>

          <div>
            <Card className="desktop-card mb-4">
              <Card.Header>
                <h5 className="mb-0">
                  Seleziona Studenti ({selectedStudents.length}/6)
                </h5>
              </Card.Header>
              <Card.Body>
                
                <div style={{ maxHeight: '260px', overflowY: 'auto' }}>
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
                disabled={submitting || selectedStudents.length < 2}
                // Button disabled in case of submitting or if less than 2 students are selected
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
