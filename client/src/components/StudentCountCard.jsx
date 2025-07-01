import { Card } from 'react-bootstrap';

function StudentCountCard({ studentCount }) {
  return (
    <div className="desktop-grid mb-4">
      <Card className="desktop-card">
        <Card.Body>
          <h6>Totale Studenti</h6>
          <h3 className="text-primary">{studentCount}</h3>
        </Card.Body>
      </Card>
    </div>
  );
}

export default StudentCountCard;
