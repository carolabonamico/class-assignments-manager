import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children, role, userRole }) {
  if (role && userRole !== role) {
    return <Navigate to="/assignments" replace />;
  }

  return children;
}

export default ProtectedRoute;
