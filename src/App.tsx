import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from './store';
import Login from './Pages/login/Login';
import { Dashboard } from './Pages/dashboard/Dashboard';
import Plans from './Pages/Plans/Plans';
import AddPlans from './Pages/Plans/AddPlans';
import AddAdmin from './Pages/admins/admins/AddAdmin';
import EditAdmin from './Pages/admins/admins/EditAdmin';
import EditPlans from './Pages/Plans/EditPlans';
import { Layout } from './components/layout';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AdminsList from './Pages/admins/admins/AdminsList';
import Onboarding from './Pages/onBoarding/Onboarding';
import AdminManagementList from './Pages/admins/adminManagement/AdminManagementList';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function App() {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
        />

        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/Plans" element={<Plans />} />
          <Route path="/AddPlans" element={<AddPlans />} />
          <Route path="/EditPlans/:planId" element={<EditPlans />} />
          <Route path="/Admin" element={<AdminsList />} />
          <Route path="/Admin/add" element={<AddAdmin />} />
          <Route path="/Admin/edit/:adminId" element={<EditAdmin />} />
          <Route path="/AdminManagement" element={<AdminManagementList />} />
        </Route>
        <Route path="/onboarding" element={<Onboarding />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </Router>
  );
}

export default App;
