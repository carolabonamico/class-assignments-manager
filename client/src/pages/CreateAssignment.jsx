import { useState, useEffect } from 'react';
import { Alert, Form } from 'react-bootstrap';
import API from '../API/api';
import LoadingSpinner from '../components/LoadingSpinner';
import QuestionFormCard from '../components/QuestionFormCard';
import StudentSelectionCard from '../components/StudentSelectionCard';

function CreateAssignment() {
  const [students, setStudents] = useState([]);
  const [question, setQuestion] = useState('');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [constraintError, setConstraintError] = useState('');
  const [checkingConstraints, setCheckingConstraints] = useState(false);

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
    * After changing selection, checks pair constraints via API
  */
  const handleStudentSelection = async (studentId) => {
    let newSelection;
    if (selectedStudents.includes(studentId)) {
      newSelection = selectedStudents.filter(id => id !== studentId);
    } else {
      if (selectedStudents.length < 6) {
        newSelection = [...selectedStudents, studentId];
      } else {
        return; // Don't change selection if limit reached
      }
    }
    
    setSelectedStudents(newSelection);
    
    // Check constraints after updating selection
    if (newSelection.length >= 2) {
      setCheckingConstraints(true);
      try {
        const result = await API.checkPairConstraints(newSelection);
        if (!result.isValid) {
          setConstraintError(result.error || 'Vincolo sulle coppie violato');
        } else {
          setConstraintError('');
        }
      } catch (err) {
        console.warn('Error checking constraints:', err);
        setConstraintError('');
      } finally {
        setCheckingConstraints(false);
      }
    } else {
      setConstraintError('');
    }
  };

  /* Handle form submission - adapted for new components */
  const handleSubmit = async (formData) => {
    const { question: questionText, selectedStudents: studentIds } = formData;

    if (!questionText || questionText.trim().length === 0) {
      setError('La domanda è obbligatoria');
      return;
    }

    if (studentIds.length < 2) {
      setError('Seleziona almeno 2 studenti');
      return;
    }

    if (studentIds.length > 6) {
      setError('Seleziona massimo 6 studenti');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const assignmentData = {
        question: questionText.trim(),
        studentIds: studentIds
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
        <Alert variant="success" onClose={() => setError('')} dismissible className="d-flex align-items-center">
          <div className="flex-grow-1">{success}</div>
        </Alert>
      )}

      {/* Form for creating a new assignment */}
      <Form onSubmit={(e) => {
        e.preventDefault();
        handleSubmit({ question, selectedStudents });
      }}>
        <div className="desktop-form">
          <div className="desktop-grid">
            <QuestionFormCard
              question={question}
              onQuestionChange={setQuestion}
            />
            
            <StudentSelectionCard
              students={students}
              selectedStudents={selectedStudents}
              onStudentToggle={handleStudentSelection}
              submitting={submitting}
              constraintError={constraintError}
              checkingConstraints={checkingConstraints}
            />
          </div>
        </div>
      </Form>
    </div>
  );
}

export default CreateAssignment;
