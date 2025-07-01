import { useState, useEffect } from 'react';
import { Card, Table, Badge } from 'react-bootstrap';
import API from '../API/api';
import LoadingSpinner from '../components/LoadingSpinner';
import StudentAverageCard from '../components/StudentAverageCard';

function MyScores() {
  const [data, setData] = useState({ assignments: [], weightedAverage: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchScores = async () => {
      try {
        const result = await API.getStudentScores();
        setData(result);
      } catch {
        setError('Errore nel caricamento dei punteggi');
      } finally {
        setLoading(false);
      }
    };

    fetchScores();
  }, []);

  if (loading) return <LoadingSpinner />;

  const { assignments, weightedAverage } = data;

  return (
    <div className="desktop-layout">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="text-primary-blue">I Miei Punteggi</h1>
      </div>

      {error && (
        <div className="alert alert-danger">{error}</div>
      )}

      {/* Weighted Average Card */}
      <StudentAverageCard 
        average={weightedAverage} 
        label="Media Ponderata" 
      />

      {/* Assignments Table */}
      <Card className="desktop-card">
        <Card.Header>
          <h5 className="mb-0">Compiti Completati</h5>
        </Card.Header>
        <Card.Body>
          {assignments.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted">Non hai ancora completato nessun compito.</p>
            </div>
          ) : (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Domanda</th>
                  <th>Docente</th>
                  <th>Dimensione Gruppo</th>
                  <th>Punteggio</th>
                  <th>Stato</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map(assignment => (
                  <tr key={assignment.id}>
                    <td>
                      <strong>#{assignment.id}</strong>
                    </td>
                    <td>
                      <div style={{ maxWidth: '300px' }}>
                        {assignment.question.length > 100 
                          ? `${assignment.question.substring(0, 100)}...`
                          : assignment.question
                        }
                      </div>
                    </td>
                    <td>{assignment.teacherName}</td>
                    <td>
                      <Badge bg="info">
                        {assignment.groupSize} {assignment.groupSize === 1 ? 'studente' : 'studenti'}
                      </Badge>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <span className={`fw-bold ${assignment.score >= 18 ? 'text-success' : 'text-danger'}`}>
                          {assignment.score}
                        </span>
                        <span className="text-muted ms-1">/30</span>
                      </div>
                    </td>
                    <td>
                      <Badge bg={assignment.score >= 18 ? 'success' : 'danger'}>
                        {assignment.score >= 18 ? 'Superato' : 'Non Superato'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

    </div>
  );
}

export default MyScores;
