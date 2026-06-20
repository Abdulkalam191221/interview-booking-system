import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, token, loading } = useContext(AuthContext);

  // If the context is still loading local storage, show a brief loading state
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#1e293b' }}>
        <h3>Loading your session...</h3>
      </div>
    );
  }

  // If not logged in, redirect straight back to login page
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // If logged in but doesn't have the correct access role (e.g., candidate trying to access admin)
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/candidate/dashboard'} replace />;
  }

  // All checks passed! Render the target dashboard page
  return children;
};

export default ProtectedRoute;