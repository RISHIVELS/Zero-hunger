import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";

// Auth components
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";

// Dashboard components
import AcceptorDashboard from "./components/acceptor/AcceptorDashboard";
import DonorDashboard from "./components/donor/DonorDashboard";
import WarehouseDashboard from "./components/warehouse/WarehouseDashboard";

// Common components
import Home from "./components/common/Home";

function App() {
  const allowedRoles = {
    donor: ["donor"],
    acceptor: ["acceptor"],
    warehouse: ["warehouse"],
  };

  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route
            path="/acceptor/dashboard"
            element={
              <ProtectedRoute allowedRoles={["acceptor"]}>
                <AcceptorDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/donor/dashboard"
            element={
              <ProtectedRoute allowedRoles={["donor"]}>
                <DonorDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/warehouse/dashboard"
            element={
              <ProtectedRoute allowedRoles={["warehouse"]}>
                <WarehouseDashboard />
              </ProtectedRoute>
            }
          />

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
