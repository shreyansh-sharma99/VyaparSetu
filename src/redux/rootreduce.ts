import { combineReducers } from '@reduxjs/toolkit';
import uiReducer from '@/store/slices/uiSlice';
import authReducer from '@/Pages/login/services/authSlice';
import userReducer from '@/Pages/login/services/userSlice';

import planReducer from '@/Pages/Plans/services/PlanSlice';
import adminReducer from '@/Pages/admins/admins/services/adminSlice';
import subscriptionReducer from '@/Pages/subscription/services/subscriptionSlice';

const rootReducer = combineReducers({
  ui: uiReducer,
  auth: authReducer,
  user: userReducer,
  plan: planReducer,
  admin: adminReducer,
  subscription: subscriptionReducer,
});

export default rootReducer;
