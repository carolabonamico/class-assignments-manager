import { Card } from 'react-bootstrap';

function StudentAverageCard({ average }) {
  const getAverageContent = () => {
    // If the average is a valid number, display it
    if (average !== null && typeof average === 'number' && !isNaN(average)) {
      return (
        <h2 className={`display-4 mb-0 ${average >= 18 ? 'text-success' : 'text-danger'}`}>
          {average.toFixed(2)}/30
        </h2>
      );
    }
    
    // If no valid average is available, show a message
    return (
      <p className="text-muted">Non hai ancora compiti valutati</p>
    );
  };

  return (
    <div className="desktop-grid mb-4">
      <Card className="desktop-card">
        <Card.Body className="text-center">
          <h6>Media Punteggi</h6>
          {getAverageContent()}
        </Card.Body>
      </Card>
    </div>
  );
}

export default StudentAverageCard;
