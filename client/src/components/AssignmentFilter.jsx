import { Form } from 'react-bootstrap';

function AssignmentFilter({ filter, onFilterChange }) {
  return (
    <div className="mb-4">
      <Form.Group>
        <Form.Label>Filtra per stato:</Form.Label>
        <Form.Select value={filter} onChange={(e) => onFilterChange(e.target.value)}>
          <option value="all">Tutti i compiti</option>
          <option value="open">Solo aperti</option>
          <option value="closed">Solo chiusi</option>
        </Form.Select>
      </Form.Group>
    </div>
  );
}

export default AssignmentFilter;
