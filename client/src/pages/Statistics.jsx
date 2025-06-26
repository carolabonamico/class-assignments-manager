import { useState, useEffect } from 'react';
import { Card, Table, Form, Badge } from 'react-bootstrap';
import API from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

function Statistics() {
  const [stats, setStats] = useState([]);
  const [sortedStats, setSortedStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('name'); // name, total, average

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await API.getStatistics();
        setStats(data);
        setSortedStats(data);
      } catch {
        setError('Errore nel caricamento delle statistiche');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  useEffect(() => {
    let sorted = [...stats];
    
    switch (sortBy) {
      case 'name':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'total':
        sorted.sort((a, b) => b.total_assignments - a.total_assignments);
        break;
      case 'average':
        sorted.sort((a, b) => (b.weighted_average || 0) - (a.weighted_average || 0));
        break;
      default:
        break;
    }
    
    setSortedStats(sorted);
  }, [stats, sortBy]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="desktop-layout">
      <h1 className="text-primary-blue">Statistiche Studenti</h1>
      <p className="text-muted mb-4">
        Panoramica dello stato dei compiti per tutti gli studenti della classe.
      </p>

      {error && (
        <div className="alert alert-danger">{error}</div>
      )}

      <div className="desktop-grid mb-4">
        <Card className="desktop-card">
          <Card.Body>
            <h6>Totale Studenti</h6>
            <h3 className="text-primary">{stats.length}</h3>
          </Card.Body>
        </Card>
        <Card className="desktop-card">
          <Card.Body>
            <h6>Media Classe</h6>
            <h3 className="text-success">
              {stats.length > 0 
                ? (stats.reduce((sum, s) => sum + (s.weighted_average || 0), 0) / stats.length).toFixed(2)
                : '0.00'
              }
            </h3>
            </Card.Body>
          </Card>
        </div>

      <Card className="desktop-table">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Statistiche Dettagliate</h5>
          <Form.Group className="mb-0" style={{ minWidth: '200px' }}>
            <Form.Label className="mb-1">Ordina per:</Form.Label>
            <Form.Select 
              size="sm" 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="name">Nome (A-Z)</option>
              <option value="total">Numero totale compiti</option>
              <option value="average">Media punteggi</option>
            </Form.Select>
          </Form.Group>
        </Card.Header>
        <Card.Body>
          {sortedStats.length === 0 ? (
            <p className="text-muted text-center">Nessuna statistica disponibile.</p>
          ) : (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Studente</th>
                  <th className="text-center">Compiti Aperti</th>
                  <th className="text-center">Compiti Chiusi</th>
                  <th className="text-center">Totale</th>
                  <th className="text-center">Media Ponderata</th>
                </tr>
              </thead>
              <tbody>
                {sortedStats.map(student => (
                  <tr key={student.id}>
                    <td>
                      <strong>{student.name}</strong>
                      <br />
                      <small className="text-muted">{student.email}</small>
                    </td>
                    <td className="text-center">
                      <Badge bg="success">{student.open_assignments}</Badge>
                    </td>
                    <td className="text-center">
                      <Badge bg="primary">{student.closed_assignments}</Badge>
                    </td>
                    <td className="text-center">
                      <strong>{student.total_assignments}</strong>
                    </td>
                    <td className="text-center">
                      {student.weighted_average !== null ? (
                        <Badge 
                          bg={student.weighted_average >= 24 ? 'success' : 
                              student.weighted_average >= 18 ? 'warning' : 'danger'}
                          text={student.weighted_average >= 24 ? 'white' : 'dark'}
                        >
                          {student.weighted_average.toFixed(2)}
                        </Badge>
                      ) : (
                        <span className="text-muted">N/A</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      <Card className="mt-4">
        <Card.Header>
          <h6 className="mb-0">Note sulla Media Ponderata</h6>
        </Card.Header>
        <Card.Body>
          <small className="text-muted">
            La media ponderata è calcolata considerando l'inverso del numero di studenti nel gruppo come peso. 
            Ad esempio, un punteggio ottenuto in un gruppo di 6 studenti vale la metà di un punteggio ottenuto in un gruppo di 3 studenti.
            Sono considerati solo i compiti chiusi con valutazione assegnata.
          </small>
        </Card.Body>
      </Card>
    </div>
  );
}

export default Statistics;
