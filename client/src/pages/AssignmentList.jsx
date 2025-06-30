import { useState, useEffect } from 'react';
import { Card, Badge, Button, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import API from '../API/api';
import LoadingSpinner from '../components/LoadingSpinner';
import dayjs from 'dayjs';
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

      {user.role == 'student' && (
        <div className="desktop-grid mb-4">
          <Card className="desktop-card">
            <Card.Body>
              <h6>Media attuale</h6>
              <h3 className="text-primary">
                {(() => {
                  const scoredAssignments = assignments.filter(a => a.score !== null && a.score !== undefined);
                  if (scoredAssignments.length === 0) {
                    return "N/A";
                  }
                  const average = scoredAssignments.reduce((sum, a) => sum + a.score, 0) / scoredAssignments.length;
                  return average.toFixed(2);
                })()}
              </h3>
              </Card.Body>
            </Card>
        </div>
      )}

      {/* Filter dropdown to select assignment status */}
      <div className="mb-4">
        <Form.Group>
          <Form.Label>Filtra per stato:</Form.Label>
          <Form.Select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">Tutti i compiti</option>
            <option value="open">Solo aperti</option>
            <option value="closed">Solo chiusi</option>
          </Form.Select>
        </Form.Group>
      </div>

      {/* If no assignments match the filter, show a message */}
      {/* If there are no assignments, show a message with a button to create the first assignment */}
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
                  </Card.Text>
                  {assignment.answer && (
                    <div className="mb-4 text-success">
                        <i className="bi bi-check-circle me-1"></i>
                        Risposta inviata
                    </div>
                  )}
                  <div className="mt-auto">
                    <Button 
                      as={Link} 
                      to={`/assignments/${assignment.id}`} 
                      variant="primary" 
                      size="sm"
                      className="w-100"
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
