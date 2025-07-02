import { Card, Row, Col } from 'react-bootstrap';
import StatsSortFilter from './StatsSortFilter';
import StudentStatsRow from './StudentStatsRow';

function StatsTable({ stats, sortBy, onSortChange }) {
  return (
    <Card className="desktop-table">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <StatsSortFilter sortBy={sortBy} onSortChange={onSortChange} />
      </Card.Header>

      <Card.Body>
        {stats.length === 0 ? (
          <p className="text-muted text-center">Nessuna statistica disponibile.</p>
        ) : (
          <>
            {/* Header Row */}
            <Row className="fw-bold border-bottom pb-2 mb-3">
              <Col md={4}>Studente</Col>
              <Col md={2} className="text-center">Compiti Aperti</Col>
              <Col md={2} className="text-center">Compiti Chiusi</Col>
              <Col md={2} className="text-center">Totale</Col>
              <Col md={2} className="text-center">Media Ponderata</Col>
            </Row>

            {/* Data Rows */}
            {stats.map(student => (
              <StudentStatsRow key={student.id} student={student} />
            ))}
          </>
        )}
      </Card.Body>
    </Card>
  );
}

export default StatsTable;
