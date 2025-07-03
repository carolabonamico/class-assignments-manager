import { Card } from 'react-bootstrap';
import useAuth from '../hooks/useAuth';
import StudentAnswerSection from './StudentAnswerSection';
import TeacherEvaluationSection from './TeacherEvaluationSection';

function OpenAssignmentCard({ assignment, onUpdateAssignment, onRemoveAssignment, onEvaluationAlert }) {
  const { user } = useAuth();

  return (
    <Card className="desktop-card mb-4">
      <Card.Header>
        <h5 className="mb-0">{assignment.question}</h5>
      </Card.Header>
      
      <Card.Body>
        {user.role === 'student' && (
          <StudentAnswerSection 
            assignment={assignment} 
            onUpdateAssignment={onUpdateAssignment}
          />
        )}

        {user.role === 'teacher' && (
          assignment.answer ? (
            <TeacherEvaluationSection 
              assignment={assignment} 
              onRemoveAssignment={onRemoveAssignment}
              onEvaluationAlert={onEvaluationAlert}
            />
          ) : (
            <em className="text-muted">
              Nessuna risposta ancora fornita dagli studenti.
            </em>
          )
        )}
      </Card.Body>
    </Card>
  );
}

export default OpenAssignmentCard;
