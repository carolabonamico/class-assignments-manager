import { useState, useEffect } from 'react';
import { Card, Form, Badge, Row, Col } from 'react-bootstrap';
import API from '../API/api';
import LoadingSpinner from '../components/LoadingSpinner';

function Statistics() {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('name'); // name, total, average

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await API.getStatistics();
        setStats(data);
      } catch {
        setError('Errore nel caricamento delle statistiche');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Sorting implementation
  const sortedStats = [...stats].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'total':
        return b.total_assignments - a.total_assignments;
      case 'average':
        return (b.weighted_average || 0) - (a.weighted_average || 0);
      default:
        return 0;
    }
  });

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

      {/* Display total students*/}
      <div className="desktop-grid mb-4">
        <Card className="desktop-card">
          <Card.Body>
            <h6>Totale Studenti</h6>
            <h3 className="text-primary">{stats.length}</h3>
          </Card.Body>
        </Card>
      </div>

      {/* Detailed Statistics Table */}
      {/* If no stats available, show a message */}
      {/* If stats are available, display them in a table format */}
      <Card className="desktop-table">

        <Card.Header className="d-flex justify-content-between align-items-center">
          <Form.Group className="mb-0" style={{ minWidth: '200px' }}>
            <Form.Label className="mb-1">Ordina per:</Form.Label>
            <Form.Select
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
            <div>
              {/* Header Row */}
              <Row className="fw-bold border-bottom pb-2 mb-3">
                <Col md={4}>Studente</Col>
                <Col md={2} className="text-center">Compiti Aperti</Col>
                <Col md={2} className="text-center">Compiti Chiusi</Col>
                <Col md={2} className="text-center">Totale</Col>
                <Col md={2} className="text-center">Media Ponderata</Col>
              </Row>

              {/* Data Rows */}
              {sortedStats.map(student => (
                <Row key={student.id} className="py-3 border-bottom align-items-center hover-row">
                  <Col md={4} className="mb-2 mb-md-0">
                    <strong>{student.name}</strong>
                    <br />
                    <small className="text-muted">{student.email}</small>
                  </Col>
                  <Col md={2} className="text-center">
                    <Badge bg="success">{student.open_assignments}</Badge>
                  </Col>
                  <Col md={2} className="text-center">
                    <Badge bg="primary">{student.closed_assignments}</Badge>
                  </Col>
                  <Col md={2} className="text-center">
                    <strong>{student.total_assignments}</strong>
                  </Col>
                  <Col md={2} className="text-center">
                    {student.weighted_average !== null ? (
                      <Badge 
                        bg={student.weighted_average >= 24 ? 'success' : 
                            student.weighted_average >= 18 ? 'warning' : 'danger'}
                        text={'white'}
                      >
                        {student.weighted_average.toFixed(2)}
                      </Badge>
                    ) : (
                      <span className="text-muted">N/A</span>
                    )}
                  </Col>
                </Row>
              ))}
            </div>
          )}
        </Card.Body>
      </Card>

    </div>
  );
}

export default Statistics;
