import { useState, useEffect } from 'react';
import { Card, Badge, Button, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import API from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import dayjs from 'dayjs';

function AssignmentList({ user }) {
  const [assignments, setAssignments] = useState([]);
  const [filteredAssignments, setFilteredAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all, open, closed

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const data = await API.getAssignments();
        setAssignments(data);
        setFilteredAssignments(data);
      } catch {
        setError('Errore nel caricamento dei compiti');
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, []);

  useEffect(() => {
    let filtered = assignments;
    if (filter === 'open') {
      filtered = assignments.filter(a => a.status === 'open');
    } else if (filter === 'closed') {
      filtered = assignments.filter(a => a.status === 'closed');
    }
    setFilteredAssignments(filtered);
  }, [assignments, filter]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="desktop-layout">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="text-primary-blue">Lista Compiti</h1>
        {user.role === 'teacher' && (
          <Button as={Link} to="/create-assignment" variant="success">
            Crea Nuovo Compito
          </Button>
        )}
      </div>

      {error && (
        <div className="alert alert-danger">{error}</div>
      )}

      <div className="mb-4" style={{maxWidth: '300px'}}>
        <Form.Group>
          <Form.Label>Filtra per stato:</Form.Label>
          <Form.Select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">Tutti i compiti</option>
            <option value="open">Solo aperti</option>
            <option value="closed">Solo chiusi</option>
          </Form.Select>
        </Form.Group>
      </div>

      {filteredAssignments.length === 0 ? (
        <Card className="desktop-card">
          <Card.Body className="text-center">
            <p className="text-muted">Nessun compito trovato con i filtri selezionati.</p>
            {user.role === 'teacher' && (
              <Button as={Link} to="/create-assignment" variant="primary">
                Crea il primo compito
              </Button>
            )}
          </Card.Body>
        </Card>
      ) : (
        <div className="assignment-list-desktop">
          {filteredAssignments.map(assignment => (
            <Card key={assignment.id} className="desktop-card h-100">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <Badge bg={assignment.status === 'open' ? 'success' : 'primary'}>
                  {assignment.status === 'open' ? 'Aperto' : 'Chiuso'}
                </Badge>
                {assignment.score && (
                  <Badge bg="warning" text="dark">
                    {assignment.score}/30
                  </Badge>
                )}
              </Card.Header>
              <Card.Body className="d-flex flex-column">
                <Card.Title className="text-truncate" title={assignment.question}>
                  {assignment.question.length > 50 
                    ? assignment.question.substring(0, 50) + '...'
                    : assignment.question
                  }
                </Card.Title>
                <Card.Text>
                  <small className="text-muted">
                    <strong>
                      {user.role === 'teacher' ? 'Creato' : 'Assegnato da'}:
                    </strong> {assignment.teacher_name}<br />
                    <strong>Data creazione:</strong> {dayjs(assignment.created_date).format('DD/MM/YYYY HH:mm')}
                  </small>
                </Card.Text>
                {assignment.answer && (
                  <div className="mt-2">
                    <Badge bg="success" className="me-2">
                      <i className="bi bi-check-circle me-1"></i>
                      Risposta inviata
                    </Badge>
                    {assignment.score && (
                      <Badge bg="warning" text="dark">
                        Voto: {assignment.score}/30
                      </Badge>
                    )}
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
      )}
    </div>
  );
}

export default AssignmentList;
