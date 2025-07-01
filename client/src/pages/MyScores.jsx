import { useState, useEffect } from 'react';
import API from '../API/api';
import LoadingSpinner from '../components/LoadingSpinner';
import StudentAverageCard from '../components/StudentAverageCard';
import ClosedAssignmentTable from '../components/ClosedAssignmentTable';

function MyScores() {
  const [data, setData] = useState({ assignments: [], weightedAverage: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchScores = async () => {
      try {
        const result = await API.getStudentScores();
        setData(result);
      } catch {
        setError('Errore nel caricamento dei punteggi');
      } finally {
        setLoading(false);
      }
    };

    fetchScores();
  }, []);

  if (loading) return <LoadingSpinner />;

  const { assignments, weightedAverage } = data;

  return (
    <div className="desktop-layout">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="text-primary-blue">I Miei Punteggi</h1>
      </div>

      {error && (
        <div className="alert alert-danger">{error}</div>
      )}

      {/* Weighted Average Card */}
      <StudentAverageCard 
        average={weightedAverage} 
        label="Media Ponderata" 
      />

      {/* Assignments Table */}
      <ClosedAssignmentTable assignments={assignments}/>

    </div>
  );
}

export default MyScores;
