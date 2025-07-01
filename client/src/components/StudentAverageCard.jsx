import { Card } from 'react-bootstrap';

function StudentAverageCard({ average, label = "Media Punteggi" }) {
  return (
    <div className="desktop-grid mb-4">
      <Card className="desktop-card">
        <Card.Body className="text-center">
          <h6>{label}</h6>
          {average !== null && average !== undefined ? (
            <div>
              <h2 className="text-primary display-4 mb-0">
                {average.toFixed(2)}/30
              </h2>
            </div>
          ) : (
            <div>
              <p className="text-muted">Completa almeno un compito per vedere la tua media</p>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}

export default StudentAverageCard;
