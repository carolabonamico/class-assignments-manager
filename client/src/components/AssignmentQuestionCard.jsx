import { Card, Badge } from 'react-bootstrap';
import dayjs from 'dayjs';
import useAuth from '../hooks/useAuth';

function AssignmentQuestionCard({ assignment }) {
  const { user } = useAuth();
  const isStudent = user.role === 'student';

  return (
    <Card className="mb-4">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Domanda</h5>
        <Badge bg={assignment.status === 'open' ? 'success' : 'primary'}>
          {assignment.status === 'open' ? 'Aperto' : 'Chiuso'}
        </Badge>
      </Card.Header>
      <Card.Body>
        <p>{assignment.question}</p>
        <hr />
        <small className="text-muted">
          {isStudent && (
            <>
              <strong>Docente:</strong> {assignment.teacher_name}<br />
            </>
          )}
          <strong>Data creazione:</strong> {dayjs(assignment.created_date).format('DD/MM/YYYY HH:mm')}
        </small>
      </Card.Body>
    </Card>
  );
}

export default AssignmentQuestionCard;
