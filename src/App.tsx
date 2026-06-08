import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { usePermission, getSlugFromPath } from '@/utility/permission';
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
import TeamMemberList from './Pages/teamMember/teamMembers/TeamMemberList';
import AddTeamMember from './Pages/teamMember/teamMembers/AddTeamMember';
import EditTeamMember from './Pages/teamMember/teamMembers/EditTeamMember';
import TeamMemberHierarchy from './Pages/teamMember/teamMembers/TeamMemberHierarchy';
import AdminReport from './Pages/reports/adminReports/AdminReport';
import RevenueReport from './Pages/reports/revenueReports/RevenueReport';
import SubscriptionReport from './Pages/reports/subscriptionReports/SubscriptionReport';
import InvoiceReport from './Pages/reports/invoiceReports/InvoiceReport';
import RazorpayPayments from './Pages/reports/RazorpayPayments/RazorpayPayments';
import RazorpaySettlements from './Pages/reports/RazorpaySettlements/RazorpaySettlements';
import Invoice from './Pages/invoices/Invoice';
import InvoiceDetails from './Pages/invoices/InvoiceDetails';
import RoleAndPermissionList from './Pages/RolesAndPermission/RoleAndPermissionList';
import CreateRolesAndPermission from './Pages/RolesAndPermission/CreateRolesAndPermission';
import RoleDetails from './Pages/RolesAndPermission/RoleDetails';
import UpdateRoleAndPermission from './Pages/RolesAndPermission/UpdateRoleAndPermission';
import DesignationList from './Pages/teamMember/designations/DesignationList';
import AddDesignation from './Pages/teamMember/designations/AddDesignation';
import EditDesignation from './Pages/teamMember/designations/EditDesignation';
import CashWallet from './Pages/cash/CashWallet';
import CashLedger from './Pages/cash/CashLedger';
import CashReport from './Pages/cash/CashReport';
import HelpDesk from './Pages/HelpDesk/helpDeskManagement/HelpDesk';
import HelpDeskStats from './Pages/HelpDesk/helpDeskManagement/HelpDeskStats';
import HelpDeskDetails from './Pages/HelpDesk/helpDeskManagement/HelpDeskDetails';
import ListEmailTemplate from './Pages/settings/emailTemplate/ListEmailTemplate';
import CreateEmailTemplate from './Pages/settings/emailTemplate/CreateEmailTemplate';
import UpdateEmailTemplate from './Pages/settings/emailTemplate/UpdateEmailTemplate';
import ViewEmailTemplate from './Pages/settings/emailTemplate/ViewEmailTemplate';
import SendEmail from './Pages/email/SendEmail';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const location = useLocation();
  const { hasMenuPermission, hasActionPermission, isTeamMember } = usePermission();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (isTeamMember) {
    const slug = getSlugFromPath(location.pathname);
    if (slug !== '/' && !hasMenuPermission(slug)) {
      return <Navigate to="/" replace />;
    }

    const pathLower = location.pathname.toLowerCase();
    const isCreatePage = pathLower.includes('/add') || pathLower.includes('/create') || pathLower.includes('/addplans');
    const isEditPage = pathLower.includes('/edit') || pathLower.includes('/update') || pathLower.includes('/editplans');

    if (isCreatePage && !hasActionPermission(slug, 'canWrite')) {
      return <Navigate to="/" replace />;
    }
    if (isEditPage && !hasActionPermission(slug, 'canUpdate')) {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
}

function OwnerRoute({ children }: { children: React.ReactNode }) {
  const { profile } = useSelector((state: RootState) => state.user);
  const userType = profile?.user?.userType || profile?.userType || localStorage.getItem('userType');

  if (userType !== 'owner') {
    return <Navigate to="/Cash/wallet" replace />;
  }
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
          <Route path="/settings/email-templates" element={<ListEmailTemplate />} />
          <Route path="/settings/email-templates/create" element={<CreateEmailTemplate />} />
          <Route path="/settings/email-templates/edit/:id" element={<UpdateEmailTemplate />} />
          <Route path="/settings/email-templates/view/:id" element={<ViewEmailTemplate />} />

          {/* Email */}
          <Route path="/email" element={<SendEmail />} />

          {/* Team Member */}
          <Route path="/TeamMembers" element={<TeamMemberList />} />
          <Route path="/TeamMembers/add" element={<AddTeamMember />} />
          <Route path="/TeamMembers/edit/:id" element={<EditTeamMember />} />
          <Route path="/TeamMembers/hierarchy" element={<TeamMemberHierarchy />} />
          <Route path="/designations" element={<DesignationList />} />
          <Route path="/designations/add" element={<AddDesignation />} />
          <Route path="/designations/edit/:id" element={<EditDesignation />} />

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

          {/* Roles & Permissions */}
          <Route path="/roles" element={<RoleAndPermissionList />} />
          <Route path="/roles/create" element={<CreateRolesAndPermission />} />
          <Route path="/roles/view/:roleId" element={<RoleDetails />} />
          <Route path="/roles/edit/:roleId" element={<UpdateRoleAndPermission />} />

          {/* Cash Management */}
          <Route path="/Cash/wallet" element={<CashWallet />} />
          <Route path="/Cash/ledger" element={<OwnerRoute><CashLedger /></OwnerRoute>} />
          <Route path="/Cash/report/:userId" element={<OwnerRoute><CashReport /></OwnerRoute>} />

          {/* HelpDesk */}
          <Route path="/HelpDesk" element={<HelpDesk />} />
          <Route path="/HelpDesk/stats" element={<HelpDeskStats />} />
          <Route path="/HelpDesk/view/:id" element={<HelpDeskDetails />} />
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
