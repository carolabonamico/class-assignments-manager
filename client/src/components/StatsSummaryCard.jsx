import { Card } from 'react-bootstrap';

function StatsSummaryCard({ totalStudents }) {
  return (
    <div className="desktop-grid mb-4">
      <Card className="desktop-card">
        <Card.Body>
          <h6>Totale Studenti</h6>
          <h3 className="text-primary">{totalStudents}</h3>
        </Card.Body>
      </Card>
    </div>
  );
}

export default StatsSummaryCard;
