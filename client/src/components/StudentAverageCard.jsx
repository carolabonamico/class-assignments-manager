import { Card } from 'react-bootstrap';

function StudentAverageCard({ assignments }) {
  const calculateWeightedAverage = () => {
    const scoredAssignments = assignments.filter(a => a.score !== null);
    if (scoredAssignments.length === 0) return "N/A";
    
    let weightedSum = 0;
    let totalWeight = 0;
    
    scoredAssignments.forEach(a => {
      const groupSize = a.group_members?.length || 1;
      const weight = 1 / groupSize;
      weightedSum += a.score * weight;
      totalWeight += weight;
    });
    
    return (weightedSum / totalWeight).toFixed(2);
  };

  return (
    <div className="desktop-grid mb-4">
      <Card className="desktop-card">
        <Card.Body>
          <h6>Media attuale</h6>
          <h3 className="text-primary">
            {calculateWeightedAverage()}
          </h3>
        </Card.Body>
      </Card>
    </div>
  );
}

export default StudentAverageCard;
