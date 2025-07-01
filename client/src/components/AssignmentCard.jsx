import { Card, Badge, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

function AssignmentCard({ assignment }) {
  const navigate = useNavigate();

  return (
    <Card className="desktop-card h-100">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <Badge bg={assignment.status === 'open' ? 'success' : 'primary'}>
          {assignment.status === 'open' ? 'Aperto' : 'Chiuso'}
        </Badge>
        {assignment.score !== null && assignment.score !== undefined && (
          <Badge bg="secondary">
            {assignment.score}/30
          </Badge>
        )}
      </Card.Header>

      <Card.Body className="d-flex flex-column">
        <Card.Title className="text-truncate" title={assignment.question || 'Domanda non disponibile'}>
          {assignment.question || 'Domanda non disponibile'}
        </Card.Title>

        <Card.Text>
          <small className="text-muted">
            <strong>Data creazione:</strong> {assignment.created_date ? dayjs(assignment.created_date).format('DD/MM/YYYY HH:mm') : 'Data non disponibile'}
          </small>
          {assignment.answer && (
            <>
              <br />
              <small className="text-success">
                <strong>Risposta inviata</strong>
              </small>
            </>
          )}
        </Card.Text>

        <div className="mt-auto">
          <Button 
            variant="primary" 
            size="sm"
            className="w-100" 
            onClick={() => navigate(`/assignments/${assignment.id}`)}
          >
            Visualizza Dettagli
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
}

export default AssignmentCard;
