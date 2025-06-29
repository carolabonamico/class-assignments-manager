import { useState, useEffect } from 'react';
import { Card, Badge, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import API from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import dayjs from 'dayjs';

function Dashboard({ user }) {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  if (loading) return <LoadingSpinner />;

  const openAssignments = assignments.filter(a => a.status === 'open');
  const closedAssignments = assignments.filter(a => a.status === 'closed');

  return (
    <div className="desktop-layout">
      <h1 className="text-primary-blue">Dashboard</h1>
      <p className="text-muted mb-4">
        Benvenuto, {user.name}! Ruolo: {user.role === 'teacher' ? 'Docente' : 'Studente'}
      </p>

      {error && (
        <div className="alert alert-danger">{error}</div>
      )}

      {/* Show current average score for students */}
      {user.role == 'student' && (
        <div className="desktop-grid mb-4">
          <Card className="desktop-card">
            <Card.Body>
              <h6>Media attuale</h6>
              <h3 className="text-primary">
                {(() => {
                  const scoredAssignments = assignments.filter(a => a.score !== null && a.score !== undefined);
                  if (scoredAssignments.length === 0) {
                    return "Non è ancora presente alcuna valutazione";
                  }
                  const average = scoredAssignments.reduce((sum, a) => sum + a.score, 0) / scoredAssignments.length;
                  return average.toFixed(2);
                })()}
              </h3>
              </Card.Body>
            </Card>
        </div>
      )}

      {/* Display open and closed assignments in a grid layout */}
      <div className="desktop-grid">

        {/* Display open assignments in a card */}
        <Card className="desktop-card">
          <Card.Header className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Compiti Aperti</h5>
            <Badge bg="success">{openAssignments.length}</Badge>
          </Card.Header>
          <Card.Body>
            {openAssignments.length === 0 ? (
              <p className="text-muted">Nessun compito aperto</p>
            ) : (
              <div>
                {openAssignments.slice(0, 3).map(assignment => (
                  <div key={assignment.id} className="mb-2">
                    <Link 
                      to={`/assignments/${assignment.id}`} 
                      className="text-decoration-none"
                    >
                      <div className="border rounded p-2 hover-bg-light">
                        <span className="text-muted">{assignment.question.substring(0, 50)}...</span>
                        <br />
                        <small className="text-muted">
                          Data creazione: {dayjs(assignment.created_date).format('DD/MM/YYYY HH:mm')}
                        </small>
                      </div>
                    </Link>
                  </div>
                ))}
                {openAssignments.length > 3 && (
                  <Button as={Link} to="/assignments" variant="outline-primary" size="sm">
                    Vedi tutti ({openAssignments.length})
                  </Button>
                )}
              </div>
            )}
          </Card.Body>
        </Card>

        {/* Display closed assignments in a card */}
        <Card className="desktop-card">
          <Card.Header className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Compiti Completati</h5>
            <Badge bg="primary">{closedAssignments.length}</Badge>
          </Card.Header>
          <Card.Body>
            {closedAssignments.length === 0 ? (
              <p className="text-muted">Nessun compito completato</p>
            ) : (
              <div>
                {closedAssignments.slice(0, 3).map(assignment => (
                  <div key={assignment.id} className="mb-2">
                    <Link 
                      to={`/assignments/${assignment.id}`} 
                      className="text-decoration-none"
                    >
                      <div className="border rounded p-2 hover-bg-light">
                        <span className="text-muted">{assignment.question.substring(0, 50)}...</span>
                        <br />
                        <small className="text-muted">
                          Voto: {assignment.score || 'N/A'}/30
                        </small>
                      </div>
                    </Link>
                  </div>
                ))}
                {closedAssignments.length > 3 && (
                  <Button as={Link} to="/assignments" variant="outline-primary" size="sm">
                    Vedi tutti ({closedAssignments.length})
                  </Button>
                )}
              </div>
            )}
          </Card.Body>
        </Card>
      </div>

      {/* Quick Actions for teachers */}
      <div className="mt-4">
        <Card className="desktop-card">
          <Card.Header>
            <h5 className="mb-0">Azioni Rapide</h5>
          </Card.Header>
          <Card.Body>
            <div className="d-flex gap-2 flex-wrap">
              <Button as={Link} to="/assignments" variant="primary">
                Visualizza tutti i compiti
              </Button>
              {user.role === 'teacher' && (
                <>
                  <Button as={Link} to="/create-assignment" variant="success">
                    Crea nuovo compito
                  </Button>
                  <Button as={Link} to="/statistics" variant="warning">
                    Visualizza statistiche
                  </Button>
                </>
              )}
            </div>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
}

export default Dashboard;
