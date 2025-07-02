import { useState, useEffect } from 'react';
import { Card, Alert } from 'react-bootstrap';
import API from '../API/api';
import LoadingSpinner from '../components/LoadingSpinner';
import AssignmentCard from '../components/AssignmentCard';
import useAuth from '../hooks/useAuth';
import Header from '../components/Header';

function OpenAssignments() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOpenAssignments = async () => {
      try {
        const data = await API.getOpenAssignments();
        setAssignments(data);
      } catch {
        setError('Errore nel caricamento dei compiti aperti');
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
      <Header title={user.role === 'teacher' ? 'Compiti Aperti da Valutare' : 'Compiti Aperti'} />

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
          </Card.Body>
        </Card>
      ) : (
        <>
          {assignments.map(assignment => (
            <AssignmentCard
              key={assignment.id}
              assignment={assignment}
              onUpdateAssignment={handleUpdateAssignment}
              onRemoveAssignment={handleRemoveAssignment}
            />
          ))}
        </>
      )}
    </>
  );
}

export default OpenAssignments;
