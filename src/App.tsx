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
import AdminDetails from './Pages/admins/admins/AdminDetails';
import Onboarding from './Pages/onBoarding/Onboarding';
import AdminManagementList from './Pages/admins/adminManagement/AdminManagementList';
import Subscription from './Pages/subscription/Subscription';
import SubscriptionDetails from './Pages/subscription/SubscriptionDetails';
import Settings from './Pages/settings/Settings';
import TeamMemberList from './Pages/teamMember/TeamMemberList';
import AddTeamMember from './Pages/teamMember/AddTeamMember';
import EditTeamMember from './Pages/teamMember/EditTeamMember';
import AdminReport from './Pages/reports/adminReports/AdminReport';
import RevenueReport from './Pages/reports/revenueReports/RevenueReport';
import SubscriptionReport from './Pages/reports/subscriptionReports/SubscriptionReport';
import InvoiceReport from './Pages/reports/invoiceReports/InvoiceReport';
import RazorpayPayments from './Pages/reports/RazorpayPayments/RazorpayPayments';
import RazorpaySettlements from './Pages/reports/RazorpaySettlements/RazorpaySettlements';
import Invoice from './Pages/invoices/Invoice';
import InvoiceDetails from './Pages/invoices/InvoiceDetails';


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
          {/* Plans */}
          <Route path="/Plans" element={<Plans />} />
          <Route path="/AddPlans" element={<AddPlans />} />
          <Route path="/EditPlans/:planId" element={<EditPlans />} />

          {/* Admin */}
          <Route path="/Admin" element={<AdminsList />} />
          <Route path="/Admin/add" element={<AddAdmin />} />
          <Route path="/Admin/edit/:adminId" element={<EditAdmin />} />
          <Route path="/Admin/view/:adminId" element={<AdminDetails />} />
          <Route path="/AdminManagement" element={<AdminManagementList />} />
          <Route path="/AdminManagement/view/:adminId" element={<AdminDetails />} />

          {/* Subscription */}
          <Route path="/Subscriptions" element={<Subscription />} />
          <Route path="/Subscriptions/view/:id" element={<SubscriptionDetails />} />

          {/*Settings  */}
          <Route path="/settings" element={<Settings />} />

          {/* Team Member */}
          <Route path="/TeamMembers" element={<TeamMemberList />} />
          <Route path="/TeamMembers/add" element={<AddTeamMember />} />
          <Route path="/TeamMembers/edit/:id" element={<EditTeamMember />} />

          {/* Reports */}
          <Route path="/reports/admin" element={<AdminReport />} />
          <Route path="/reports/revenue" element={<RevenueReport />} />
          <Route path="/reports/subscriptions" element={<SubscriptionReport />} />
          <Route path="/reports/invoices" element={<InvoiceReport />} />
          <Route path="/reports/razorpay-payments" element={<RazorpayPayments />} />
          <Route path="/reports/razorpay-settlements" element={<RazorpaySettlements />} />

          {/* Invoice */}
          <Route path="/Invoices" element={<Invoice />} />
          <Route path="/Invoices/view/:id" element={<InvoiceDetails />} />
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
