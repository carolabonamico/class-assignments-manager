import { useState, useEffect } from 'react';
import { Card } from 'react-bootstrap';
import API from '../API/api';
import LoadingSpinner from '../components/LoadingSpinner';
import StudentAverageCard from '../components/StudentAverageCard';
import AssignmentFilter from '../components/AssignmentFilter';
import AssignmentCard from '../components/AssignmentCard';
import useAuth from '../hooks/useAuth';

function AssignmentList() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all, open, closed

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const data = await API.getAssignments();
        setAssignments(data);
      } catch {
        setError('Errore nel caricamento dei compiti');
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, []);

  /* Computing the filtered assignments directly instead of using useEffect */
  const filteredAssignments = assignments.filter(assignment => {
    if (filter === 'open') return assignment.status === 'open';
    if (filter === 'closed') return assignment.status === 'closed';
    return true; // 'all'
  });

  if (loading) return <LoadingSpinner />;

  return (
    <div className="desktop-layout">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="text-primary-blue">Lista Compiti</h1>
      </div>

      {error && (
        <div className="alert alert-danger">{error}</div>
      )}


      {user.role === 'student' && (
        <StudentAverageCard assignments={assignments} />
      )}

      <AssignmentFilter filter={filter} onFilterChange={setFilter} />

      {filteredAssignments.length === 0 ? (
        <Card className="desktop-card">
          <Card.Body className="text-center">
            <p className="text-muted">Nessun compito trovato con i filtri selezionati.</p>
          </Card.Body>
        </Card>
      ) : (
        <>
          {/* Display assignments in a grid layout */}
          <div className="assignment-list-desktop">
            {filteredAssignments.map(assignment => (
              <AssignmentCard key={assignment.id} assignment={assignment} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default AssignmentList;
