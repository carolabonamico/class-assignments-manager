import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children, requiredRole, userRole }) {
  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to="/assignments" replace />;
  }

  return children;
}

export default ProtectedRoute;
