import { useState, useEffect } from 'react';
import { Card, Alert } from 'react-bootstrap';
import API from '../API/api';
import LoadingSpinner from '../components/LoadingSpinner';
import OpenAssignmentCard from '../components/OpenAssignmentCard';
import useAuth from '../hooks/useAuth';
import PageHeader from '../components/PageHeader';

function OpenAssignments() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [evaluationAlert, setEvaluationAlert] = useState(null); // { type: 'success'|'error', message: string }

  useEffect(() => {
    const fetchOpenAssignments = async () => {
      try {
        const data = await API.getOpenAssignments();
        setAssignments(data);
      } catch (err) {
        setError(err.message || 'Errore nel caricamento dei compiti aperti');
      } finally {
        setLoading(false);
      }
    };

    fetchOpenAssignments();
  }, []);

  const handleUpdateAssignment = (assignmentId, updatedAssignment) => {
    setAssignments(prev => prev.map(assignment => 
      assignment.id === assignmentId ? updatedAssignment : assignment
    ));
  };

  const handleRemoveAssignment = (assignmentId) => {
    setAssignments(prev => prev.filter(assignment => assignment.id !== assignmentId));
  };

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <PageHeader 
        title={user.role === 'teacher' ? 'Compiti Aperti da Valutare' : 'Compiti Aperti'} 
        description={user.role === 'teacher' 
          ? 'Valuta i compiti aperti dagli studenti.' 
          : 'Invia le tue risposte ai compiti aperti.'}
      />

      {error && (
        <Alert variant="danger" onClose={() => setError('')} dismissible>
          {error}
        </Alert>
      )}

      {evaluationAlert && (
        <Alert 
          variant={evaluationAlert.type === 'success' ? 'success' : 'danger'} 
          onClose={() => setEvaluationAlert(null)} 
          dismissible
        >
          {evaluationAlert.message}
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
          </Card.Body>
        </Card>
      ) : (
        <>
          {assignments.map(assignment => (
            <OpenAssignmentCard
              key={assignment.id}
              assignment={assignment}
              onUpdateAssignment={handleUpdateAssignment}
              onRemoveAssignment={handleRemoveAssignment}
              onEvaluationAlert={setEvaluationAlert}
            />
          ))}
        </>
      )}
    </>
  );
}

export default OpenAssignments;
