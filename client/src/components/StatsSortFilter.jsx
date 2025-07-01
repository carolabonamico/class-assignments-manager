import { Form } from 'react-bootstrap';

function StatsSortFilter({ sortBy, onSortChange }) {
  return (
    <Form.Group className="mb-0" style={{ minWidth: '200px' }}>
      <Form.Label className="mb-1">Ordina per:</Form.Label>
      <Form.Select
        value={sortBy} 
        onChange={(e) => onSortChange(e.target.value)}
      >
        <option value="name">Nome (A-Z)</option>
        <option value="total">Numero totale compiti</option>
        <option value="average">Media punteggi</option>
      </Form.Select>
    </Form.Group>
  );
}

export default StatsSortFilter;
