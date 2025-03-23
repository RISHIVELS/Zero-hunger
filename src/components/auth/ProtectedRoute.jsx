import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, userRole, loading } = useAuth();

  // If still loading authentication state, show nothing or a loading spinner
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If roles are specified and user's role doesn't match, redirect to appropriate dashboard
  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    // Redirect to the appropriate dashboard based on user role
    if (userRole === "donor") {
      return <Navigate to="/donor/dashboard" replace />;
    } else if (userRole === "acceptor") {
      return <Navigate to="/acceptor/dashboard" replace />;
    } else {
      // If role is unknown, redirect to login
      return <Navigate to="/login" replace />;
    }
  }

  // If all checks pass, render the children
  return children;
};

export default ProtectedRoute;
