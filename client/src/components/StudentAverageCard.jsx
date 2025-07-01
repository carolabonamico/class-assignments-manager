import { Card } from 'react-bootstrap';

function StudentAverageCard({ assignments }) {
  const calculateSimpleAverage = () => {
    // Filters only closed assignments with a score
    const closedScoredAssignments = assignments.filter(a => 
      a.status === 'closed' && 
      a.score !== null && 
      a.score !== undefined
    );
    
    if (closedScoredAssignments.length === 0) return "N/A";

    // Calculates the simple average of the scores
    const sum = closedScoredAssignments.reduce((total, assignment) => total + assignment.score, 0);
    const average = sum / closedScoredAssignments.length;
    
    return average.toFixed(1);
  };

  return (
    <div className="desktop-grid mb-4">
      <Card className="desktop-card">
        <Card.Body>
          <h6>Media Punteggi</h6>
          <h3 className="text-primary">
            {calculateSimpleAverage() === "N/A"
              ? "N/A"
              : `${calculateSimpleAverage()}/30`
            }
          </h3>
        </Card.Body>
      </Card>
    </div>
  );
}

export default StudentAverageCard;
