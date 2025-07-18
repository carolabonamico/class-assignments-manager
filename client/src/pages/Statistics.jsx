import { useState, useEffect, Alert } from 'react';
import API from '../API/api';
import LoadingSpinner from '../components/LoadingSpinner';
import StatsTable from '../components/StatsTable';
import PageHeader from '../components/PageHeader';

function Statistics() {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('name'); // name, total, average

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await API.getStatistics();
        setStats(data);
      } catch (err) {
        setError(err.message || 'Errore nel caricamento delle statistiche');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Sorting implementation
  const sortedStats = [...stats].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'total':
        return b.total_assignments - a.total_assignments;
      case 'average':
        return (b.weighted_average || 0) - (a.weighted_average || 0);
      default:
        return 0;
    }
  });

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <PageHeader 
        title="Statistiche della Classe" 
        description="Panoramica dello stato dei compiti per tutti gli studenti della classe."
      />

      {error && (
        <Alert variant="danger">{error}</Alert>
      )}

      <StatsTable 
        stats={sortedStats} 
        sortBy={sortBy} 
        onSortChange={setSortBy} 
      />
    </>
  );
}

export default Statistics;
