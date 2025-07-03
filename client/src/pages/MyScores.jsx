import { useState, useEffect, Alert } from 'react';
import API from '../API/api';
import LoadingSpinner from '../components/LoadingSpinner';
import StudentAverageCard from '../components/StudentAverageCard';
import ClosedAssignmentTable from '../components/ClosedAssignmentTable';
import PageHeader from '../components/PageHeader';

function MyScores() {
  const [data, setData] = useState({ assignments: [], weightedAverage: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchScores = async () => {
      try {
        const result = await API.getClosedAvg();
        setData(result);
      } catch (err) {
        setError(err.message || 'Errore nel caricamento dei punteggi');
        setData({ assignments: [], weightedAverage: null });
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
      <PageHeader title="I miei Punteggi" />

      {error && (
        <Alert variant="danger">{error}</Alert>
      )}

      {/* Weighted Average Card */}
      <StudentAverageCard average={weightedAverage}/>

      {/* Assignments Table */}
      <ClosedAssignmentTable assignments={assignments}/>

    </>
  );
}

export default MyScores;
