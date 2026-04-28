import { combineReducers } from '@reduxjs/toolkit';
import uiReducer from '@/store/slices/uiSlice';
import authReducer from '@/Pages/login/services/authSlice';
import userReducer from '@/Pages/login/services/userSlice';

import planReducer from '@/Pages/Plans/services/PlanSlice';
import adminReducer from '@/Pages/admins/admins/services/adminSlice';
import subscriptionReducer from '@/Pages/subscription/services/subscriptionSlice';
import settingsReducer from '@/Pages/settings/services/settingsSlice';

import teamMemberReducer from '@/Pages/teamMember/services/teamMemberSlice';
import dashboardReducer from '@/Pages/dashboard/services/dashboardSlice';

import adminReportReducer from '@/Pages/reports/adminReports/services/adminReportSlice';
import revenueReportReducer from '@/Pages/reports/revenueReports/services/revenueReportSlice';
import subscriptionReportReducer from '@/Pages/reports/subscriptionReports/services/subscriptionReportSlice';
import invoiceReportReducer from '@/Pages/reports/invoiceReports/services/invoiceReportSlice';
import razorpayPaymentsReducer from '@/Pages/reports/RazorpayPayments/services/razorpayPaymentsSlice';
import razorpaySettlementsReducer from '@/Pages/reports/RazorpaySettlements/services/razorpaySettlementsSlice';
import invoiceReducer from '@/Pages/invoices/services/invoiceSlice';

const rootReducer = combineReducers({
  ui: uiReducer,
  auth: authReducer,
  user: userReducer,
  plan: planReducer,
  admin: adminReducer,
  subscription: subscriptionReducer,
  settings: settingsReducer,
  teamMember: teamMemberReducer,
  dashboard: dashboardReducer,
  adminReport: adminReportReducer,
  revenueReport: revenueReportReducer,
  subscriptionReport: subscriptionReportReducer,
  invoiceReport: invoiceReportReducer,
  razorpayPayments: razorpayPaymentsReducer,
  razorpaySettlements: razorpaySettlementsReducer,
  invoice: invoiceReducer,
});

export default rootReducer;
