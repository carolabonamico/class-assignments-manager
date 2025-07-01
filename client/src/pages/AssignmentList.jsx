import { useState, useEffect } from 'react';
import { Card, Badge, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import API from '../API/api';
import LoadingSpinner from '../components/LoadingSpinner';
import StudentAverageCard from '../components/StudentAverageCard';
import AssignmentFilter from '../components/AssignmentFilter';
import dayjs from 'dayjs';
import useAuth from '../hooks/useAuth';

function AssignmentList() {
  const { user } = useAuth();
  const navigate = useNavigate();
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
              <Card key={assignment.id} className="desktop-card h-100">

                <Card.Header className="d-flex justify-content-between align-items-center">
                  <Badge bg={assignment.status === 'open' ? 'success' : 'primary'}>
                    {assignment.status === 'open' ? 'Aperto' : 'Chiuso'}
                  </Badge>
                  {assignment.score !== null && assignment.score !== undefined && (
                    <Badge 
                          bg={Number(assignment.score) >= 24 ? 'success' : 
                              Number(assignment.score) >= 18 ? 'warning' : 'danger'}
                          text={'white'}
                    >
                      {assignment.score}/30
                    </Badge>
                  )}
                </Card.Header>

                <Card.Body className="d-flex flex-column">
                  <Card.Title className="text-truncate" title={assignment.question || 'Domanda non disponibile'}>
                    {assignment.question || 'Domanda non disponibile'}
                  </Card.Title>

                  <Card.Text>
                    <small className="text-muted">
                      <strong>Data creazione:</strong> {assignment.created_date ? dayjs(assignment.created_date).format('DD/MM/YYYY HH:mm') : 'Data non disponibile'}
                    </small>
                    {assignment.answer && (
                      <>
                        <br />
                        <small className="text-success">
                            <strong>Risposta inviata</strong>
                        </small>
                      </>
                    )}
                  </Card.Text>
                  

                  <div className="mt-auto">
                    <Button 
                      variant="primary" 
                      size="sm"
                      className="w-100" 
                      onClick={() => navigate(`/assignments/${assignment.id}`)}
                    >
                      Visualizza Dettagli
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default AssignmentList;
