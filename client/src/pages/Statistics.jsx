import { useState, useEffect } from 'react';
import API from '../API/api';
import LoadingSpinner from '../components/LoadingSpinner';
import StatsTable from '../components/StatsTable';

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
      } catch {
        setError('Errore nel caricamento delle statistiche');
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
    <div className="desktop-layout">
      <h1 className="text-primary-blue">Statistiche Studenti</h1>
      <p className="text-muted mb-4">
        Panoramica dello stato dei compiti per tutti gli studenti della classe.
      </p>

      {error && (
        <div className="alert alert-danger">{error}</div>
      )}

      <StatsTable 
        stats={sortedStats} 
        sortBy={sortBy} 
        onSortChange={setSortBy} 
      />
    </div>
  );
}

export default Statistics;
