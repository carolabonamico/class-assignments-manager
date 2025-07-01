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
                {average.toFixed(2)}
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
    </div>
  );
}

export default StudentAverageCard;
