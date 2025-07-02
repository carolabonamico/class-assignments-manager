import { useState, useEffect, Alert } from 'react';
import API from '../API/api';
import LoadingSpinner from '../components/LoadingSpinner';
import StudentAverageCard from '../components/StudentAverageCard';
import ClosedAssignmentTable from '../components/ClosedAssignmentTable';
import Header from '../components/Header';

function MyScores() {
  const [data, setData] = useState({ assignments: [], weightedAverage: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchScores = async () => {
      try {
        const result = await API.getClosedAvg();
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
    <>
      <Header title="I miei Punteggi" />

      {error && (
        <Alert variant="danger">{error}</Alert>
      )}

      {/* Weighted Average Card */}
      <StudentAverageCard 
        average={weightedAverage} 
        label="Media Ponderata" 
      />

      {/* Assignments Table */}
      <ClosedAssignmentTable assignments={assignments}/>

    </>
  );
}

export default MyScores;
