import { useState, useEffect, useActionState } from 'react';
import { Alert, Form, Button } from 'react-bootstrap';
import API from '../API/api';
import LoadingSpinner from '../components/LoadingSpinner';
import NewQuestionFormCard from '../components/NewQuestionFormCard';
import StudentSelectionCard from '../components/StudentSelectionCard';
import PageHeader from '../components/PageHeader';

function CreateAssignment() {
  const [students, setStudents] = useState([]);
  const [question, setQuestion] = useState('');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [constraintError, setConstraintError] = useState('');
  const [checkingConstraints, setCheckingConstraints] = useState(false);

  const [state, formAction, isPending] = useActionState(createAssignmentAction, {});

  async function createAssignmentAction(prevState, formData) {
    const questionText = formData.get('question') || question;
    const studentIds = selectedStudents; // Using local state for selected students because we want to validate the current selection

    if (!questionText || questionText.trim().length === 0) {
      return { error: 'La domanda è obbligatoria' };
    }

    if (studentIds.length < 2) {
      return { error: 'Seleziona almeno 2 studenti' };
    }

    if (studentIds.length > 6) {
      return { error: 'Seleziona massimo 6 studenti' };
    }

    // Final constraint validation before submission
    try {
      const constraintResult = await API.checkPairConstraints(studentIds);
      if (!constraintResult.isValid) {
        return { error: constraintResult.error || 'Vincolo sulle coppie violato. Modifica la selezione degli studenti.' };
      }
    } catch {
      return { error: 'Impossibile verificare i vincoli sulle coppie. Controlla la connessione e riprova.' };
    }

    try {
      const assignmentData = {
        question: questionText.trim(),
        studentIds: studentIds
      };

      await API.createAssignment(assignmentData);
      
      // Reset form after successful creation
      setQuestion('');
      setSelectedStudents([]);
      
      return { success: 'Compito creato con successo!' };
    } catch (err) {
      if (err.status === 401) {
        return { error: 'Sessione scaduta. Ricarica la pagina per effettuare nuovamente il login.' };
      } else {
        return { error: err.message || 'Errore nella creazione del compito' };
      }
    }
  }

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const data = await API.getStudents();
        setStudents(data);
      } catch (err) {
        setError(err.message || 'Errore nel caricamento degli studenti. Ricarica la pagina per effettuare nuovamente il login.');
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

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
      setConstraintError('');
      
      try {
        const result = await API.checkPairConstraints(newSelection);
        if (!result.isValid) {
          setConstraintError(result.error || 'Vincolo sulle coppie violato');
        } else {
          setConstraintError('');
        }
      } catch {
        // If constraint check fails, show a warning but allow user to continue
        setConstraintError('Impossibile verificare i vincoli.');
      } finally {
        setCheckingConstraints(false);
      }
    } else {
      setConstraintError('');
      setCheckingConstraints(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <PageHeader
        title="Crea Nuovo Compito" 
        description="Crea un nuovo compito per gli studenti selezionati."
      />

      {/* Show loading state */}
      {isPending && <Alert variant="warning">Creazione compito in corso...</Alert>}

      {/* Show error or success messages */}
      {error && <Alert variant="danger">{error}</Alert>}
      {state.error && <Alert variant="danger">{state.error}</Alert>}
      
      {state.success && (
        <Alert variant="success" dismissible className="d-flex align-items-center">
          <div className="flex-grow-1">{state.success}</div>
        </Alert>
      )}

      {/* Form for creating a new assignment */}
      <Form id="createAssignmentForm" action={formAction}>
        <div className="desktop-form">
          <div className="desktop-grid">
            <NewQuestionFormCard
              question={question}
              onQuestionChange={setQuestion}
            />
            
            <StudentSelectionCard
              students={students}
              selectedStudents={selectedStudents}
              onStudentToggle={handleStudentSelection}
              constraintError={constraintError}
              checkingConstraints={checkingConstraints}
            />
          </div>
        </div>
      </Form>
      
      <Button 
        type="submit" 
        variant="success" 
        form="createAssignmentForm"
        disabled={
          isPending || 
          selectedStudents.length < 2 || 
          checkingConstraints || 
          !!constraintError ||
          !question || question.trim().length === 0 
        }
        title={isPending ? 'Creazione in corso...' : 'Crea Compito'}
      >
        {isPending ? (
          <span className="visually-hidden">Creazione in corso...</span>
        ) : (
          <span>Crea Compito</span>
        )}
      </Button>
    </>
  );
}

export default CreateAssignment;
