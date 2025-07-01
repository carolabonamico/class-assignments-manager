import { useState, useEffect } from 'react';
import { Card, Table } from 'react-bootstrap';
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
            <Table>
              <thead>
                <tr>
                  <th>Domanda</th>
                  <th className="text-center">Punteggio</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map(assignment => (
                  <tr key={assignment.id}>
                    <td>
                      <div>
                        {assignment.question}
                      </div>
                    </td>
                    <td className="text-center">
                      <span className={`${assignment.score >= 18 ? 'text-success' : 'text-danger'}`}>
                        {assignment.score}/30
                      </span>
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
