import { useState, useEffect } from 'react';
import { Card, Table, Badge } from 'react-bootstrap';
import API from '../API/api';
import LoadingSpinner from '../components/LoadingSpinner';

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
      <Card className="desktop-card mb-4">
        <Card.Header>
          <h5 className="mb-0">Media Ponderata</h5>
        </Card.Header>
        <Card.Body className="text-center">
          {weightedAverage !== null ? (
            <div>
              <h2 className="text-primary display-4 mb-0">
                {weightedAverage.toFixed(2)}
              </h2>
              <p className="text-muted">/ 30</p>
            </div>
          ) : (
            <div>
              <h4 className="text-muted">Non ancora disponibile</h4>
              <p className="text-muted">Completa almeno un compito per vedere la tua media</p>
            </div>
          )}
        </Card.Body>
      </Card>

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

      {/* Summary Statistics */}
      {assignments.length > 0 && (
        <Card className="desktop-card mt-4">
          <Card.Header>
            <h5 className="mb-0">Statistiche</h5>
          </Card.Header>
          <Card.Body>
            <div className="row text-center">
              <div className="col-md-3">
                <div className="border-end">
                  <h4 className="text-primary">{assignments.length}</h4>
                  <p className="text-muted mb-0">Compiti Completati</p>
                </div>
              </div>
              <div className="col-md-3">
                <div className="border-end">
                  <h4 className="text-success">
                    {assignments.filter(a => a.score >= 18).length}
                  </h4>
                  <p className="text-muted mb-0">Superati</p>
                </div>
              </div>
              <div className="col-md-3">
                <div className="border-end">
                  <h4 className="text-danger">
                    {assignments.filter(a => a.score < 18).length}
                  </h4>
                  <p className="text-muted mb-0">Non Superati</p>
                </div>
              </div>
              <div className="col-md-3">
                <h4 className="text-info">
                  {Math.max(...assignments.map(a => a.score))}
                </h4>
                <p className="text-muted mb-0">Punteggio Massimo</p>
              </div>
            </div>
          </Card.Body>
        </Card>
      )}
    </div>
  );
}

export default MyScores;
